import { MetaModel } from "../../src";
import { MetaModelRepo } from "../../src/resource/meta/meta.model.repo";
import { META_MODEL_REPO } from "../../src/resource/resource.constants";
import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb = Sqlite3TestUtil.getWdisDb();

describe('Sqlite3Meta', () => {
    beforeAll(async () => {
        let sqls:string[] = [
            `DROP VIEW IF EXISTS VwTestMeta`,
            `DROP TABLE IF EXISTS TestMeta5`,
            `DROP TABLE IF EXISTS TestMeta4`,
            `DROP TABLE IF EXISTS TestMeta`,
            `DROP TABLE IF EXISTS TestMeta2`,
            `DROP TABLE IF EXISTS TestMeta3`,
        `CREATE TABLE IF NOT EXISTS TestMeta2 (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT, "name" TEXT
        )`,
        `CREATE TABLE IF NOT EXISTS TestMeta3 (
            "id1" INTEGER, "id2" TEXT, descricao TEXT default 'ola, como vai!', PRIMARY KEY (id1, id2)
        )`,
        `CREATE TABLE IF NOT EXISTS TestMeta (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "name" TEXT, "create" DATE NOT NULL DEFAULT CURRENT_DATE,
            id_test INTEGER CHECK( id_test>0 ), idt31 INTEGER, idt32 TEXT,
            FOREIGN KEY(id_test) REFERENCES TestMeta2(id),
            FOREIGN KEY(idt31, idt32) REFERENCES TestMeta3(id1,id2) on update cascade on delete set default
        )`,
        `CREATE TABLE IF NOT EXISTS TestMeta4 (
            "id1" INTEGER PRIMARY KEY AUTOINCREMENT, "id2" INTEGER, id3 INTEGER,
            FOREIGN KEY(id2) REFERENCES TestMeta(id),
            FOREIGN KEY(id3) REFERENCES TestMeta(id)
        )`,
        `CREATE TABLE IF NOT EXISTS TestMeta5 (
            "id1" INTEGER PRIMARY KEY AUTOINCREMENT, "id_teste" INTEGER, id_teste2 INTEGER,
            FOREIGN KEY(id_teste) REFERENCES TestMeta(id),
            FOREIGN KEY(id_teste2) REFERENCES TestMeta(id)
        )`,
        `CREATE unique INDEX IDX_TestMeta ON TestMeta(id,id_test,idt31,idt32);`,
        `CREATE INDEX IDX_TestMeta2 ON TestMeta(id,id_test,idt32);`,
        `INSERT INTO TestMeta ("id", "name") VALUES (1, 'Teste Meta 1')`,
        `INSERT INTO TestMeta ("id", "name") VALUES (2, 'Teste Meta 2')`,
        `INSERT INTO TestMeta ("id", "name") VALUES (3, 'Teste Meta 3')`,
        
        `CREATE VIEW VwTestMeta("id","name","create") as select "id","name","create" from TestMeta;`

        ];
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(()=>{

    });

    describe('When Meta TestMeta', () => {

        it('Should Meta TestMeta', async () => {
            const modelName = 'TestMeta';
            let metaModel = await wdisDb.meta().fromResource(modelName) as MetaModel;
            // console.log(JSON.stringify(metaModel, undefined, 2));
            
            wdisDb.meta().setMetaModel(modelName, metaModel);
            
            let modelStr = wdisDb.meta().modelLikePrisma(modelName);
            console.log(modelStr);

            expect(metaModel?.modelName).toBe(modelName);
        })

        it('Should Meta Show All Table Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let tableNames = await metaRepo.tableNames();
            // console.log(JSON.stringify(tableNames, undefined, 2));
            
            expect(tableNames).toContain('TestMeta3');
        })

        it('Should Meta Show All View Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let viewNames = await metaRepo.viewNames();
            // console.log(JSON.stringify(viewNames, undefined, 2));
            
            expect(viewNames).toContain('VwTestMeta');
        });

        it('Should Meta Show All Sequence Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let sequenceNames = await metaRepo.sequenceNames();
            // console.log(JSON.stringify(sequenceNames, undefined, 2));
            
            expect(sequenceNames).toContain('TestMeta');
        });

        it('Should Meta Generate MetaModel of a View', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            const viewName = 'VwTestMeta';
            let viewModel = await metaRepo.view(viewName);
            // console.log(JSON.stringify(viewModel, undefined, 2));
            
            expect(viewModel.modelName).toBe(viewName);
        })
        


        it('Should run an select native query', async () => {
            let result = await wdisDb.resource.native('select * from TestMeta').run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(1).toBe(1);
        })
        
        it('Should select in model type view', async () => {
            let result = await wdisDb.select('VwTestMeta');
            // console.log('Select View VwTestMeta Result: '+JSON.stringify(result));
            expect(1).toBe(1);
        })
        
        // it('Should select TestMeta', async () => {
        //     const qryMeta = wdisDb.model('TestMeta').select();
        //     let sqlRendered = qryMeta.render();
        //     console.log('Test wdisDb.Meta: '+sqlRendered);
            
        //     let result = await qryMeta.list();
        //     console.log('Test wdisDb.Meta Result: '+JSON.stringify(result));
        //     expect(1).toBe(1);
        // })
    });
});