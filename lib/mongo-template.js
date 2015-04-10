/**
 * テンプレート
 */

var template = [
  'var Mongo = require(\'cocotte-driver-mongodb\');',
  '',
  'var config = {',
  '  host: \'127.0.0.1\',',
  '  port: 27017,',
  '  db: \'cocotte\'',
  '};',
  '',
  'var mongo = new Mongo(config);'
];


module.exports = exports = template;