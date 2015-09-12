var ROW_STATES = require('cocotte-row-states');
var Driver = require('cocotte-driver-mongo');
var db = new Driver();
var table = 'table1';

// 追加
var row = {
  field1: 'foo',
  field2: 100,
  rowState: ROW_STATES.ADDED
};
db.save(table, row)(function(err) {
  if (err) {throw err;}

  // 更新
  row.field1 = 'bar';
  row.rowState = ROW_STATES.MODIFIED;
  db.save(table, row)(function (err) {
    if (err) {throw err;}

    // 削除
    row.rowState = ROW_STATES.DELETED;
    db.save(table, row)(function (err) {
      if (err) {throw err;}

      console.log('done');
    });
  });
});


