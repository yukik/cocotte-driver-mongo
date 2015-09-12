
var ROW_STATES = require('cocotte-row-states');

var Driver = require('cocotte-driver-mongo');
var db = new Driver();
var flow = require('cocotte-flow');
var table = 'table1';

flow(function*(){


  console.log(yield db.count(table));

  // 追加
  var row = {
    field1: 'foo',
    field2: 100,
    rowState: ROW_STATES.ADDED
  };
  yield db.save(table, row);

  console.log(yield db.count(table));

  // 更新
  row.field1 = 'bar';
  row.rowState = ROW_STATES.MODIFIED;
  yield db.save(table, row);

  console.log(yield db.count(table));

  // 削除
  row.rowState = ROW_STATES.DELETED;
  yield db.save(table, row);

  console.log(yield db.count(table));

  console.log('done');
});