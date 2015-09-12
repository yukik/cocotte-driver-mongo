/**
 * 複数行の取得
 */

var db = require('./section1');
var flow = require('cocotte-flow');
flow(function*(){

  var table = 'table1';

  var rows = yield db.find(table);

  var selector = {field1: 'foo1'};
  rows = yield db.find(table, selector);

  var fields = ['field1', 'field2'];
  rows = yield db.find(table, null, fields);

  var sort = [['field1', false]];
  rows = yield db.find(table, null, null, sort);

  var skip = 10;
  rows = yield db.find(table, null, null, null, skip);

  var limit = 5;
  rows = yield db.find(table, null, null, null, null, limit);


  rows = yield db.find(table, selector, fields, sort, skip, limit);

  console.log(rows);

});