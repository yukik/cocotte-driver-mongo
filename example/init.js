/**
 * 例のソースコードために、table1にサンプル行を1000行追加します
 */
var ROW_STATES = require('cocotte-row-states');
var db = require('./section1');
var flow = require('cocotte-flow');

flow(function*(){

  var table = 'table1';

  for(var i = 0; i < 10; i++) {
    var row = {
      field1  : 'foo' + n(),
      field2  : n(),
      field3  : new Date(2015, 0, n(365)),
      rowState: ROW_STATES.ADDED
    };
    yield db.save(table, row);
  }

});

// ランダム数字の取得
function n(num) {
  return Math.floor(Math.random() * (num || 100));
}