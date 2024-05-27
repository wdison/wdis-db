# @wdis/db - Easiest and fast query builder

## Select
1. [Simple example](#simple-example)
1. [Select With Simple Where Clause](#select-with-simple-where-clause)

### Simple example
```js
// const { WdisDb } = require('@wdis/db');
import { ConfResource, WdisDb } from "@wdis/db";

const confResource: ConfResource = {
    resource: 'mysql',
    url: '127.0.0.1',
    options:{
        host: '127.0.0.1',
        port: '23306',
        user: 'root',
        password: 'testrootpassword',
        database: 'mysqldb_test'
    }
};

const wdisDb = new WdisDb(confResource);

let promiseList = wdisDb
    .model('user')
    .select('id','name','email')
    .list();

promiseList.then((userLst:any/*OR Type User*/)=>{
    console.log('Result list: ');
    console.log(JSON.stringify(userLst));
});
```

### Select With Simple Where Clause
```js
let promiseList = wdisDb
    .model('user')
    .select('id','name','email')
    .where({'id':1,'lk:name': 'john'})
    .list();
```
