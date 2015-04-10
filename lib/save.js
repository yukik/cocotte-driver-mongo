/**
 * dependencies
 */
var ObjectID = require('mongodb').ObjectID;

/**
 * alias
 */
var ROW_STATES = {
  UNCHANGED : 0,   // 変更なし -> なにもしない
  ADDED     : 1,   // 追加予定 -> 追加 -> UNCHANGED
  MODIFIED  : 2,   // 変更予定 -> 更新 -> UNCHANGED
  DELETED   : 3,   // 削除予定 -> 削除 -> DETACHED
  DETACHED  : 4,   // 削除済み -> なにもしない
  SAVING    : 5,   // 更新中   -> なにもしない
};

/**
 * 行の保存
 * @method save
 * @param  {String} table
 * @param  {Object} row
 * @return {Function} saveThunk -> {Object} row
 */
function save (table, row) {
  var self = this;
  return function saveThunk (callback) {
    switch(row.rowState){
    case ROW_STATES.UNCHANGED:
      callback(null, row);
      break;

    case ROW_STATES.ADDED:
      if (!row.rowId) {
        // 行番号が未設定の場合は設定する
        row.rowId = (new ObjectID()).toString();
        self.emit('createId', {table: table, rowId: row.rowId});
      }
      addRow(self, callback, table, row);
      break;

    case ROW_STATES.MODIFIED:
      if (!row.rowId) {
        callback(new Error('行番号が存在しません'), null);
        return;
      }
      updateRow(self, callback, table, row);
      break;

    case ROW_STATES.DELETED:
      if (!row.rowId) {
        callback(new Error('行番号が存在しません'), null);
        return;
      }
      deleteRow(self, callback, table, row);
      break;

    case ROW_STATES.DETACHED:
    case ROW_STATES.SAVING:
      callback(null, row);
      break;

    default:
      callback(new Error('行状態が不明です'), row);
      break;
    }
  };
}



// 追加
function addRow (driver, callback, table, row) {
  row.rowState = ROW_STATES.SAVING;
  var data = getAddData(row);
  var eventValue = {table: table, row: row, before: ROW_STATES.ADDED};
  driver.start(callback, function(){
    driver.db.collection(table).insert(data, {w: 1}, function(err, result) {
      row.rowState = err ? ROW_STATES.ADDED : ROW_STATES.UNCHANGED;
      driver.end(callback, err || result, 'save', eventValue);
    });
  });
}
function getAddData(row) {
  return Object.keys(row).reduce(function(x, name) {
    if (name !== 'rowId' && name !== 'rowState') {
      x[name] = row[name];
    }
    return x;
  }, {_id: new ObjectID(row.rowId)});
}



// 更新
function updateRow (driver, callback, table, row) {
  row.rowState = ROW_STATES.SAVING;
  var selector = {rowId: row.rowId};
  var data = getUpdateData(row);
  var eventValue = {table: table, row: row, before: ROW_STATES.MODIFIED};
  driver.start(callback, function(){
    driver.db.collection(table).update(selector, data, {w: 1}, function (err, result) {
      row.rowState = err ? ROW_STATES.MODIFIED : ROW_STATES.UNCHANGED;
      driver.end(callback, err || result, 'save', eventValue);
    });
  });
}
function getUpdateData(row) {
  var data = Object.keys(row).reduce(function(x, name) {
    if (name !== 'rowState' && name !== 'rowId') {
      var value = row[name];
      if (value === null || value === undefined) {
        x.$unset[name] = null;
      } else {
        x.$set[name] = value;
      }
    }
    return x;
  }, {$set: {}, $unset: {}});
  if (!Object.keys(data.$set).length) {
    delete data.$set;
  }
  if (!Object.keys(data.$unset).length) {
    delete data.$unset;
  }
  return data;
}



// 削除
function deleteRow (driver, callback, table, row) {
  row.rowState = ROW_STATES.SAVING;
  var selector = {rowId: row.rowId};
  var eventValue = {table: table, row: row, before: ROW_STATES.DELETED};
  driver.start(callback, function(){
    driver.db.collection(table).remove(selector, {w: 1}, function (err, result) {
      row.rowState = err ? ROW_STATES.DELETED : ROW_STATES.DETACHED;
      driver.end(callback, err || result, 'save', eventValue);
    });
  });
}

module.exports = exports = save;