import { ConfResource, WdisDb } from '../src';
import { TestUtil } from './test.util';

const confResource: ConfResource = {
    resource: 'sqlite3',
    url: 'C:\\ambiente\\tmp\\wdis\\db\\sqlite3.db'
};


// function waitFor(millis:number){
//     return new Promise((accept)=>{
//         setTimeout(() => {
//             accept('OK');
//         }, millis);
//     });
// }

describe('WdisDb TS',()=> {
    describe('Inside WdisDb TS',()=> {
        it('Teste executado para o numero TS',async ()=>{
            const wdisDb = new WdisDb({resource:'sqlite3', url:''});
            const model = {
                name: 'João',
                id: 1,
                email: 'jhon@email.com',
                create: new Date()
            }
            const metaModel:any = wdisDb.meta().metaModel('teste', model);
            // console.log(JSON.stringify(metaModel));
            // await waitFor(2000);
            await TestUtil.waitFor(2000);
            expect(metaModel.modelName).toBe('teste');
        })
    });
});