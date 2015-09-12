 /**
 * dependencies
 */
var ObjectID = require('mongodb').ObjectID;
var ROW_STATES = require('cocotte-row-states');

/**
 * 行の保存
 * @method save
 * @param  {String} table
 * @param  {Object} row
 * @return {Function} saveThunk -> {Boolean} success
 */
function save (table, row) {
  var self = this;
  return function saveThunk (callback) {
    switch(row.rowState){
    case ROW_STATES.UNCHANGED:
      callback(null, false);
      break;
    case ROW_STATES.ADDED:
      addRow(self, callback, table, row);
      break;
    case ROW_STATES.MODIFIED:
      updateRow(self, callback, table, row);
      break;
    case ROW_STATES.DELETED:
      deleteRow(self, callback, table, row);
      break;
    case ROW_STATES.DETACHED:
    case ROW_STATES.SAVING:
    case ROW_STATES.SAVE_SUCCESS:
    case ROW_STATES.SAVE_FAILURE:
      callback(null, false);
      break;
    default:
      callback(new Error('行状態が不明です'));
      break;
    }
  };
}

// 追加
function addRow (driver, callback, table, row) {

  driver.start(callback, function(){

    row.rowState = ROW_STATES.SAVING;
    var data = getAddData(row);
    var eventValue = {table: table, row: row, before: ROW_STATES.ADDED};

    driver.db.collection(table).insert(data, {w: 1}, function(err, docs) {
      // 自動で追加された行番号を設定
      if (!row.rowId && docs.length) {
        row.rowId = docs[0]._id.toString();
        driver.emit('createId', {table: table, rowId: row.rowId});
      }
      changeRowState(row, err, docs.length);
      driver.end(callback, err || docs.length === 1, 'save', eventValue);

    });
  });
}
function getAddData(row) {
  var data = {};
  if (row.rowId) {
    data._id = new ObjectID(row.rowId);
  }
  return Object.keys(row).reduce(function(x, name) {
    var value = row[name];
    if (name !== 'rowId' && name !== 'rowState' && value !== undefined) {
      x[name] = value;
    }
    return x;
  }, data);
}



// 更新
function updateRow (driver, callback, table, row) {

  if (!row.rowId) {
    callback(new Error('行番号が存在しません'));
    return;
  }

  var data = getUpdateData(row);

  // 更新情報なし
  if (Object.keys(data).length === 0) {
    callback(null, false);
    return;
  }

  driver.start(callback, function(){

    var selector = getSelector(row);
    
    var eventValue = {table: table, row: row, before: ROW_STATES.MODIFIED};
    row.rowState = ROW_STATES.SAVING;

    driver.db.collection(table).update(selector, data, {w: 1}, function (err, affectedCount) {

      changeRowState(row, err, affectedCount);
      driver.end(callback, err || affectedCount === 1, 'save', eventValue);

    });
  });
}
function getUpdateData(row) {
  var data = Object.keys(row).reduce(function(x, name) {
    if (name !== 'rowState' && name !== 'rowId') {
      var value = row[name];
      if (value === undefined) {
        // undefinedは更新対象外
      } else if (value === null) {
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

  if (!row.rowId) {
    callback(new Error('行番号が存在しません'));
    return;
  }

  driver.start(callback, function(){

    var selector = getSelector(row);
    var eventValue = {table: table, row: row, before: ROW_STATES.DELETED};
    row.rowState = ROW_STATES.SAVING;

    driver.db.collection(table).remove(selector, {w: 1}, function (err, affectedCount) {

      changeRowState(row, err, affectedCount);
      driver.end(callback, err || affectedCount === 1, 'save', eventValue);

    });
  });
}

// セレクタ
function getSelector(row) {
  return {_id: new ObjectID(row.rowId)};
}

// 行状態の更新
function changeRowState(row, err, affectedCount) {
  if (err) {
    row.rowState = ROW_STATES.SAVE_FAILURE;
  } else if (affectedCount === 0) {
    row.rowState = ROW_STATES.DETACHED;
  } else {
    row.rowState = ROW_STATES.SAVE_SUCCESS;
  }
}

module.exports = exports = save;