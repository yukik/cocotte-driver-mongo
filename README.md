cocotte-driver-mongo
======

# はじめに

このモジュールは、cocotteでmongoDBを操作するためのドライバです  
mongodbモジュールのラッパーですが、モジュール間の違いを意識せずに
データベースを操作するために、インターフェースが統一されています  

プロパティやメソッドの詳しい説明は、cocotte-driverのREADME.mdを参照してください  
ここでは基本的な動作を確認するためのソースコードを記載します

# 準備

## 初期化

```
var Driver = require('cocotte-driver-mongo');

var config = {
  host: '127.0.0.1',
  port: 27017,
  dbname: 'cocotte'
};

var db = new Driver(config);
```

## 設定内容

ヘルパーをサポートしているため、各項目については次のようにすることで確認することができます。

```
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

```

# 構成変更

mongoDBはスキーマレスのデータベースのため、テーブルやフィールドの構成を変更するメソッドはサポートされていません


# データ取得

## テーブル一覧

```
db.getTables()(function(err, tables){
  console.log(tables);
});
```

coモジュールやcocotte-flowを使用した場合は次のようになります  

```
var co = require('co');
co(function*(){
  var tables = yield db.getTables();
  console.log(tables);
})();
```

```
var flow = require('cocotte-flow');
flow(function*(){
  var tables = yield db.getTables();
  console.log(tables);
});
```

使用することで同期的に記述できるため、以降の例は引数の関数内に記述されているとします  
改めて例を記述すると次のようになります  
cocotte-flowはthunkのみサポートされた簡易coです  
ただしyieldで使用するものがthunkのみの場合は、効率がよくなります

```
var tables = yield db.getTables();
console.log(tables);
```

## 複数行の取得

全行を取得します

```
var rows = yield db.find('table1');
```

条件にあった行を取得します

```
var selector = {field1: 'foo'};
var rows = yield db.find('table1', selector);
```

取得するフィールドを限定します

```
var fields = ['field1', 'field2'];
var rows = yield db.find('table1', null, fields);
```

取得順を指定します  
２番目の要素にfalseを指定すると降順になります

```
var sort = [['field1', true]];
var rows = yield db.find('table1', null, null, sort);
```

取得位置を指定します

```
var skip = 10;
var rows = yield db.find('table1', null, null, null, skip);
```

取得行数を指定します

```
var limit = 5;
var rows = yield db.find('table1', null, null, null, null, limit);
```

## 単体行の取得

最初に条件に一致した行を取得します

```
var table = 'table1';
var selector = {field1: 'foo'};
var fields = ['field1', 'field2'];
var sort = [['field3', true]];
var skip = 3;
var row = yield db.getRow(table, selector, fields, sort, skip);
```

## 値の取得

最初に条件に一致した行のフィールドの値を取得します

```
var table = 'table1';
var selector = {field1: 'foo'};
var field = 'field2';
var sort = [['field3', true]];
var skip = 3;
var value = yield db.getValue(table, selector, field, sort, skip);
```

## 行数の取得

```
var table = 'table1';
var selector = {field1: 'foo1'};
var count = yield db.count(table, selector);
```

# データ更新

単行のデータ更新（追加・更新・削除）はすべてsaveメソッドで行います  
更新する行に行状態を表すrowStateを設定します  
rowStateに設定する定数はモジュールをインストール後、次の方法で取得します

```
var ROW_STATES = require('cocotte-row-states');
```

rowStateの値により追加・更新・削除の動作が決定します

## 行の追加

```
var row = {
  field1  : 'foo11',
  field2  : 22,
  field3  : new Date(2015, 1, 2),
  rowState: ROW_STATES.ADDED
};
yield db.save(table, row);
```

## 行の更新

以下の例で更新されるフィールドはfield2のみです  
field1、field3などほかのフィールドの値はそのまま保持されます

```
var row = {
  rowId   : rowId,
  field2  : 55,
  rowState: ROW_STATES.MODIFIED
};
yield db.save(table, row);
```

キーが存在しても値がundefinedのフィールドは更新対象外です


## 行の削除

```
var row = {
  rowId   : rowId,
  rowState: ROW_STATES.DELETED
};
yield db.save(table, row);
```




