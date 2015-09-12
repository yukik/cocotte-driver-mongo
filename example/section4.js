/**
 * テーブル一覧
 */

var db = require('./section1');
var flow = require('cocotte-flow');

flow(function*(){

  var tables = yield db.getTables();
  

  for(var i = 0, len = tables.length; i < len; i++) {
    var cnt = yield db.count(tables[i]);
    console.log(tables[i] + '  :  ' + cnt);
  }


});



