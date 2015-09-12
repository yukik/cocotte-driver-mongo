/**
 * 単体行の取得
 */

var db = require('./section1');
var flow = require('cocotte-flow');
flow(function*(){

  var table = 'table1';
  var selector = {field1: 'foo1'};
  var field = 'field2';
  var sort = [['field3', true]];
  var skip = 3;
  var value = yield db.getValue(table, selector, field, sort, skip);

  console.log(value);

});