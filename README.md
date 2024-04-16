# wdis-db

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

promiseList.then((userLst:any/*OR Type User*/)=>{
    console.log(JSON.stringify(userLst));
});
```

## Supported features

| DB/Feature | Select | Insert | Delete | Update | Create | Drop | Meta Model |
| ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- | ------------- |
| SQlite | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| MySql | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| MariaDB | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| PostegreSql | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| Oracle | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |
| MS SQL | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 | 🔜 |


## Contributing

Pull requests are welcome! If you see something you'd like to add, please do. For drastic changes, please open an issue first.

