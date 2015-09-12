/**
 * 単体行の取得
 */

var db = require('./section1');
var flow = require('cocotte-flow');
flow(function*(){

  var table = 'table1';
  var selector = {field1: 'foo10'};
  var fields = ['field1', 'field2'];
  var sort = [['field3', true]];
  var skip = 3;
  var row = yield db.getRow(table, selector, fields, sort, skip);

  console.log(row);

});