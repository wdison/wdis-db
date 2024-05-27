import { WdisDb } from '../src';

const wdisDb = new WdisDb();
const model = {
    name: 'João',
    id: 1,
    email: 'jhon@email.com',
    create: new Date()
}
const metaModel = wdisDb.metaModel('teste', model);

console.log(JSON.stringify(metaModel));