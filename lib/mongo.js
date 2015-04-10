/**
 * dependencies
 */
var util = require('util');
var MongoDB = require('mongodb');
var Driver = require('cocotte-driver');
var helper = require('cocotte-helper');

/**
 * alias
 */
var ObjectID = MongoDB.ObjectID;
var DEFAULT_HOST = '127.0.0.1';
var DEFAULT_PORT = 27017;
var DEFAULT_DBNAME = 'cocotte';

/**
 * @method Mongo
 * @param  {Object} config
 */
function Mongo (config) {
  helper.copy(config || {}, this);
  var server = new MongoDB.Server(this.host || DEFAULT_HOST, this.port || DEFAULT_PORT);
  this.db = new MongoDB.Db(this.dbname || DEFAULT_DBNAME, server, {safe: true});
}
util.inherits(Mongo, Driver);
Mongo.properties = require('./mongo-properties');
Mongo.template = require('./mongo-template');

/**
 * 接続を開きます
 * @method open
 * @return {Function} openThunk -> {Boolean} opened
 */
Mongo.prototype.open = function open () {
  var self = this;
  return function openThunk (callback) {
    self.db.open(function (err){
      callback(err, !err);
    });
  };
};

/**
 * 接続を閉じます
 * @method close
 * @return {Function} closeThunk -> {Boolean} closed
 */
Mongo.prototype.close = function close () {
  var self = this;
  return function closeThunk (callback) {
    self.db.close(function(err){
      callback(err, !err);
    });
  };
};

/**
 * テーブル一覧を取得します
 * @method getTables
 * @return {Function} getTablesThunk -> {Array.String} tableNames
 */
Mongo.prototype.getTables = function getTables() {
  var self = this;
  return function getTablesThunk (callback) {
    self.start(callback, function(){
      self.db.collectionNames(function(err, results) {
        self.end(callback, err || formatTableNames(results));
      });
    });
  };
};
// テーブル一覧を配列に変換
function formatTableNames(results) {
  return results.reduce(function (x, item) {
    var names = item.name.split('.');
    if (names.length === 2) {
      x.push(names[1]);
    }
    return x;
  }, []);
}

// --- サポートされていないメソッド
// createTable
// dropTable

// getFields
// addField
// removeField

// getIndexes
// addIndex
// removeIndex

/**
 * 行番号を作成する
 * @method createId
 * @param  {String}   table
 * @return {Function} createIdThunk -> {String} rowId
 */
Driver.prototype.createId = function createId (table) {
  var self = this;
  return function createIdThunk (callback) {
    var rowId = (new ObjectID()).toString();
    callback(null, rowId);
    self.emit('createId', {table: table, rowId: rowId});
  };
};

var findAndGet = require('./findAndGet');

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
Mongo.prototype.find = findAndGet.find;

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
Mongo.prototype.getRow = findAndGet.getRow;

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
Mongo.prototype.getValue = findAndGet.getValue;

/**
 * 行数を取得します
 * @method count
 * @param  {String}   table
 * @param  {Object}   selector
 * @return {Function} countThunk -> {Number} count
 */
Mongo.prototype.count = findAndGet.count;

/**
 * 行を保存します
 * @method save
 * @param  {String}   table
 * @param  {Object}   row
 * @return {Function} saveThunk -> {Object} row
 */
Mongo.prototype.save = require('./save');

module.exports = exports = Mongo;


var db = new Mongo();

db.on('open', function(){console.log('open');});
db.on('close', function(){console.log('close');});

var co = require('co');

co(function*(){

  var tables = yield db.getTables();

  for (var i = 0, len = tables.length; i < len; i++) {
    var count = yield db.count(tables[i]);
    console.log(tables[i], count);
  }

  // var row = {
  //   rowState: 1,
  //   name: 'foo'
  // };

  // yield db.save('testaaa', row);

  var rows = yield db.find('users');
  console.log(rows);

})();








