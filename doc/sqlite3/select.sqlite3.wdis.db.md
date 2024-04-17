# @wdis/db - Easiest and fast query builder

## Select

### Simple example
```js
// const { WdisDb } = require('@wdis/db');
import { ConfResource, WdisDb } from "@wdis/db";

const confResource: ConfResource = {
    resource: 'sqlite3',
    url: 'C:\\enviroment\\tmp\\wdis\\db\\sqlite3.db'
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