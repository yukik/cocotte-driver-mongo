/**
 * MongoDBドライバのプロパティ情報
 */

var properties = {

  host: {
    type: String,
    description: [
      'ホスト',
      '省略時は127.0.0.1が設定されます'
    ]
  },

  port: {
    type: Number,
    description: [
      'ポート番号',
      '省略時は27017が設定されます'
    ]
  },

  dbname: {
    type: String,
    description: [
      'データベース名',
      '省略時はcocotteが設定されます'
    ]
  }
};

module.exports = exports = properties;