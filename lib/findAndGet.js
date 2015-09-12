/* jshint maxparams:6 */

/**
 * dependencies
 */
var ObjectID = require('mongodb').ObjectID;

/**
 * 複数行を取得します
 * @method find
 * @param  {String}   table
 * @param  {Object}   selector
 * @param  {Array}    fields
 * @param  {Array}    sort
 * @param  {Number}   skip
 * @param  {Number}   limit
 * @return {Function} findThunk -> {Array.Object} rows
 */
function find (table, selector, fields, sort, skip, limit) {
  var self = this;
  selector = getSelector(selector);
  fields = getFields(fields);
  var option = getOption(sort, skip, limit);
  return function findThunk (callback) {
    self.start(callback, function(){
      self.db.collection(table).find(selector, fields, option)
        .toArray(function(err, result){
          self.end(callback, err || formatRows(result));
        });
    });
  };
}
function formatRows(result) {
  result.forEach(function(r) {
    r.rowId = r._id.toString();
    delete r._id;
  });
  return result;
}

/**
 * 最初の行を返します
 * @method getRow
 * @param  {String}   table
 * @param  {Object}   selector
 * @param  {Array}    fields
 * @param  {Array}    sort
 * @param  {Number}   skip
 * @return {Function} getRowThunk -> {Object} row
 */
function getRow (table, selector, fields, sort, skip) {
  var self = this;
  selector = getSelector(selector);
  fields = getFields(fields);
  var option = getOption(sort, skip);
  return function getRow (callback) {
    self.start(callback, function(){
      self.db.collection(table).findOne(selector, fields, option, function(err, result) {
        self.end(callback, err || formatRow(result));
      });
    });
  };
}
function formatRow(result) {
  if (result) {
    result.rowId = result._id.toString();
    delete result._id;
    return result;
  } else {
    return null;
  }
}

/**
 * 最初の行の指定フィールドの値を取得します
 * @method getValue
 * @param  {String}   table
 * @param  {Object}   selector
 * @param  {String}   field
 * @param  {Array}    sort
 * @param  {Number}   skip
 * @return {Function} getValueThunk -> {Mixed} value 
 */
function getValue(table, selector, field, sort, skip) {
  var self = this;
  selector = getSelector(selector);
  var fields = getFields([field]);
  var option = getOption(sort, skip);
  return function getRow (callback) {
    self.start(callback, function(){
      self.db.collection(table).findOne(selector, fields, option, function(err, result) {
        self.end(callback, err || formatValue(field, result));
      });
    });
  };
}
function formatValue(field, result) {
  return result ? result[field] || null : null;
}

/**
 * 行数を取得します
 * @method count
 * @param  {String}   table
 * @param  {Object}   selector
 * @return {Function} countThunk -> {Number} count
 */
function count (table, selector) {
  var self = this;
  selector = getSelector(selector);
  return function countThunk(callback) {
    self.start(callback, function(){
      self.db.collection(table).count(selector, function(err, cnt){
        self.end(callback, err || cnt);
      });
    });
  };
}

module.exports = exports = {
  find: find,
  getRow: getRow,
  getValue: getValue,
  count: count
};


// 条件
function getSelector (selector) {
  if (!selector) {
    return null;
  }
  if (selector.rowId) {
    return {_id: new ObjectID(selector.rowId)};
  }
  return Object.keys(selector).reduce(function (x, p){
    if (p !== 'rowState') {
      x[p] = selector[p];
    }
    return x;
  }, {});
}

// フィールド
function getFields (fields) {
  if (!Array.isArray(fields) || !fields.length) {
    return null;
  }
  return fields.reduce(function(x, name){
    if (name !== 'rowId') {
      x[name] = 1;
    }
    return x;
  }, {_id: 1});
}


// オプション
function getOption (sort, skip, limit) {
  var option = {};

  if (sort) {
    option.sort = sort.map(function(x) {
      return [x[0], x[1] ? 1 : -1];
    });
  }

  if (skip) {
    option.skip = skip;
  }

  if (limit) {
    option.limit = limit;
  }

  return Object.keys(option).length ? option : null;
}
