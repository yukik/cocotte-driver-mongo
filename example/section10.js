/**
 * 行の追加・更新・削除
 */
var db = require('./section1');
var flow = require('cocotte-flow');
var ROW_STATES = require('cocotte-row-states');

flow(function*(){

  var table = 'table1';
  var fields = ['field1', 'field2'];

  // 追加
  var row = {
    field1  : 'foo' + n(),
    field2  : n(),
    field3  : new Date(2015, 0, n()),
    rowState: ROW_STATES.ADDED
  };
  yield db.save(table, row);

  var rowId = row.rowId;

  var inderted = yield db.getRow(table, {rowId: rowId}, fields);
  console.log(inderted);

  // 更新
  row = {
    rowId: rowId,
    field2: n(),
    rowState: ROW_STATES.MODIFIED
  };
  yield db.save(table, row);

  var updated = yield db.getRow(table, {rowId: rowId}, fields);
  console.log(updated);

  // 削除
  row = {
    rowId: rowId,
    rowState: ROW_STATES.DELETED
  };
  yield db.save(table, row);

  var deleted = yield db.getRow(table, {rowId: rowId}, fields);
  console.log(deleted === null);

});

// ランダム数字の取得
function n(num) {
  return Math.floor(Math.random() * (num || 100));
}
