/**
 * テーブル一覧
 */

var db = require('./section1');

db.getTables()(function(err, tables){
  console.log(tables);
});