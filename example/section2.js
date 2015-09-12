/**
 * 設定内容
 */

var Driver = require('cocotte-driver-mongo');
var helper = require('cocotte-helper').of(Driver);

// テンプレートの表示
helper.template();

// プロパティ一覧の表示
helper.property();

// 各プロパティの詳細
helper.property('host');
helper.property('port');
helper.property('dbname');