# wdis-db [![npm version](https://img.shields.io/npm/v/@wdis/db.svg?style=flat-square)](https://www.npmjs.com/package/@wdis/db) [![NPM Downloads](https://img.shields.io/npm/dm/@wdis/db.svg?style=flat-square)](http://npm-stat.com/charts.html?package=@wdis/db&from=2023-12-01)


## Supported features

| DB\Feature | Select | Insert | Delete | Update | Create | Drop | Meta Model |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| SQlite | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MySql | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| MariaDB | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| PostegreSql | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| Oracle | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| MS SQL | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| CSV | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| JSON | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| XML | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |
| Property | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ | ⚠️ |


## Install

    npm install @wdis/db
Or

    yarn install @wdis/db

### Example
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

promiseList.then((userLst:any[]/*OR Type User[]*/)=>{
    console.log(JSON.stringify(userLst));
});
```


## Contributing

Pull requests are welcome! If you see something you'd like to add, please do. For drastic changes, please open an issue first.

