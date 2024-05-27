import { WdisDb } from '../src';

const confResource = {
    resource: 'sqlite3',
    url: 'C:\\ambiente\\tmp\\wdis\\db\\sqlite3.db'
};

function waitFor(millis){
    return new Promise((accept)=>{
        setTimeout(() => {
            accept('OK');
        }, millis);
    });
}

beforeEach(() => {
    jest.setTimeout(60000);
});

describe('WdisDb 2 JS',()=> {
    describe('Inside WdisDb 2 JS',()=> {
        it('Teste executado para o numero 2 JS',async ()=>{
            const wdisDb = new WdisDb(confResource);
            const model = {
                name: 'João',
                id: 1,
                email: 'jhon@email.com',
                create: new Date()
            }
            const metaModel = wdisDb.meta().metaModel('teste', model);
            // console.log(JSON.stringify(metaModel));
            await waitFor(2000);
            return expect(metaModel.modelName).toBe('teste');
        })
    });
});