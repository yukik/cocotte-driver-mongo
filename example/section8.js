/**
 * 行数の取得
 */

var db = require('./section1');
var flow = require('cocotte-flow');
flow(function*(){

  var table = 'table1';
  var selector = {field1: 'foo1'};
  var count = yield db.count(table, selector);

  console.log(count);

});
