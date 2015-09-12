var ROW_STATES = require('cocotte-row-states');
var Driver = require('cocotte-driver-mongo');
var db = new Driver();
var flow = require('cocotte-flow');

flow(function*(){

  var table = 'table1';

  // 追加
  var row = {
    name: 'foo',
    rowState: ROW_STATES.ADDED
  };
  yield db.save(table, row);

  // 更新
  row.name = 'bar';
  row.rowState = ROW_STATES.MODIFIED;
  yield db.save(table, row);

  // 削除
  row.rowState = ROW_STATES.DELETED;
  yield db.save(table, row);
});