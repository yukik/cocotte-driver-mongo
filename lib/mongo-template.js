/**
 * テンプレート
 */

var template = [
  'var Driver = require(\'cocotte-driver-mongodb\');',
  '',
  'var config = {',
  '  host: \'127.0.0.1\',',
  '  port: 27017,',
  '  dbname: \'cocotte\'',
  '};',
  '',
  'var db = new Driver(config);'
];


module.exports = exports = template;