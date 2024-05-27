import { REPO } from "../../src";
import { MySqlTestUtil } from "./mysql.test.util";

let wdisDb = MySqlTestUtil.getWdisDb();

describe('MySqlNative', () => {
    beforeAll(async () => {
        console.log('MySqlNative beforeAll');
        let sqls:string[] = [
            `DROP VIEW IF EXISTS VwNativeUser`,
            `DROP TABLE IF EXISTS NativeUser`,
            `DROP TABLE IF EXISTS NativeUser2`,
        `CREATE TABLE IF NOT EXISTS NativeUser2 (
            id1 INTEGER, id2 VARCHAR(500), descricao VARCHAR(500) default 'ola, como vai!', PRIMARY KEY (id1, id2)
        )`,
        `CREATE TABLE IF NOT EXISTS NativeUser (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            name VARCHAR(500), dt_create DATE NOT NULL DEFAULT (CURRENT_DATE),
            id_test INTEGER CHECK( id_test>0 ), idt31 INTEGER, idt32 VARCHAR(500),
            FOREIGN KEY(idt31, idt32) REFERENCES NativeUser2(id1,id2) on update cascade on delete set default
        )`,
        `CREATE unique INDEX IDX_NativeUser ON NativeUser(id,id_test,idt31,idt32);`,
        `CREATE INDEX IDX_NativeUser2 ON NativeUser(id,id_test,idt32);`,
        `INSERT INTO NativeUser (id, name) VALUES (1, 'Teste Native 1')`,
        `INSERT INTO NativeUser (id, name) VALUES (2, 'Teste Native 2')`,
        `INSERT INTO NativeUser (id, name) VALUES (3, 'Teste Native 3')`,
        `CREATE VIEW VwNativeUser(id,name,dt_create) as select id,name,dt_create from NativeUser;`
        ];
        for(let sql of sqls){
            await MySqlTestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(()=>{
        MySqlTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('When Native NativeUser', () => {
        it('Should Native Select in View VwNativeUser', async () => {
            let resVwNativeUser = await wdisDb.resource.native('select * from VwNativeUser').run();
            
            expect(resVwNativeUser).toEqual(expect.arrayContaining([expect.objectContaining({name: 'Teste Native 1'})]));
        });

        it('Should Native Select in Table NativeUser', async () => {
            let result = await wdisDb.resource.native('select * from NativeUser').run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.arrayContaining([expect.objectContaining({name:'Teste Native 3'})]));
        });

        it('Should Native Insert in Table NativeUser2', async () => {
            let result = await wdisDb.resource.native("INSERT INTO NativeUser2 (id1, id2, descricao) VALUES (1, 3, 'Descricao Native tb2 1'), (2, 4, 'Descricao Native tb2 2')").run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.objectContaining({
                affectedRows:2, 
                info: expect.stringContaining('Duplicates: 0')
            }));
        });
        
        it('Should Native Select in Table NativeUser2 after insert native', async () => {
            let result = await wdisDb.resource.native('select * from NativeUser2').run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.arrayContaining([expect.objectContaining({descricao:'Descricao Native tb2 1'})]));
        });

        it('Should Native Insert in Table NativeUser', async () => {
            let result = await wdisDb.resource.native("INSERT INTO NativeUser (name, id_test, idt31, idt32) VALUES ('Teste Native Insert with fk', 2, 1, 3), ('Teste Native Insert 2 with fk', 5, 2, 4)").run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.objectContaining({
                affectedRows:2, 
                info: expect.stringContaining('Duplicates: 0')
            }));
        });

        it('Should Native Select in Table NativeUser after insert native', async () => {
            let result = await wdisDb.resource.native('select * from NativeUser').run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.arrayContaining([expect.objectContaining({name:'Teste Native Insert with fk'})]));
        });
    });
});