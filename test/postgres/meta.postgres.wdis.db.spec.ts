import { META_MODEL_REPO, MetaModel, MetaModelRepo, PKey, REPO } from "../../src";
import { PostgresTestUtil } from "./postgres.test.util";

let wdisDb = PostgresTestUtil.getWdisDb();
let schemaName:string='';

describe('PostgresMeta', () => {
    beforeAll(async () => {
        console.log('PostgresMeta beforeAll');
        let sqls:string[] = [
            `DROP VIEW IF EXISTS VwMetaTest`,
            `DROP TABLE IF EXISTS MetaTest5`,
            `DROP TABLE IF EXISTS MetaTest4`,
            `DROP TABLE IF EXISTS MetaTest`,
            `DROP TABLE IF EXISTS MetaTest2`,
            `DROP TABLE IF EXISTS MetaTest3`,
            `DROP SEQUENCE IF EXISTS SQMetaTest`,
            `CREATE TABLE IF NOT EXISTS MetaTest2 (
                id SERIAL PRIMARY KEY, name VARCHAR(500)
            )`,
            `CREATE TABLE IF NOT EXISTS MetaTest3 (
                id1 INTEGER, id2 VARCHAR(500), descricao VARCHAR(500) default 'ola, como vai!', PRIMARY KEY (id1, id2)
            )`,
            `CREATE TABLE IF NOT EXISTS MetaTest (
                id SERIAL NOT NULL,
                name VARCHAR(500), dt_create DATE NOT NULL DEFAULT CURRENT_DATE,
                id_test INTEGER CHECK( id_test>0 and id < 50 ), idt31 INTEGER, idt32 VARCHAR(500),
                CONSTRAINT PKMetaTest PRIMARY KEY (ID),
                FOREIGN KEY(id_test) REFERENCES MetaTest2(id),
                FOREIGN KEY(idt31, idt32) REFERENCES MetaTest3(id1,id2) on update cascade on delete set default
            )`,
            `CREATE TABLE IF NOT EXISTS MetaTest4 (
                id1 SERIAL PRIMARY KEY, id2 INTEGER, id3 INTEGER,
                FOREIGN KEY(id2) REFERENCES MetaTest(id),
                FOREIGN KEY(id3) REFERENCES MetaTest(id)
            )`,
            `CREATE TABLE IF NOT EXISTS MetaTest5 (
                id1 SERIAL PRIMARY KEY, id_teste INTEGER, id_teste2 INTEGER,
                FOREIGN KEY(id_teste) REFERENCES MetaTest(id) ON UPDATE CASCADE,
                FOREIGN KEY(id_teste2) REFERENCES MetaTest(id)
            )`,
            `CREATE unique INDEX IDX_MetaTest ON MetaTest(id,id_test,idt31,idt32);`,
            `CREATE INDEX IDX_MetaTest2 ON MetaTest(id,id_test,idt32, dt_create);`,
            `INSERT INTO MetaTest (id, name) VALUES (1, 'Teste Meta 1')`,
            `INSERT INTO MetaTest (id, name) VALUES (2, 'Teste Meta 2')`,
            `INSERT INTO MetaTest (id, name) VALUES (3, 'Teste Meta 3')`,
            `CREATE SEQUENCE SQMetaTest`,
            `CREATE VIEW VwMetaTest(id,name,dt_create) as select id,name,dt_create from MetaTest;`

        ];
        for(let sql of sqls){
            await PostgresTestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(() => {
        PostgresTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('When Meta MetaTest', () => {

        it('Should Meta Get Current Schema Name', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            schemaName = await metaRepo.schemaName();
            console.log('currentSchema:', schemaName);
            expect(schemaName).toEqual(expect.stringMatching(/^.{1,}$/));
        })

        it('Should Meta Show All Schema Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let schemaNames = await metaRepo.schemaNames();
            // console.log(schemaNames);
            expect(schemaNames).toContain('public');
        })

        it('Should Meta MetaTest', async () => {
            const modelName = 'MetaTest';
            let metaModel = await wdisDb.meta().fromResource(modelName, schemaName) as MetaModel;
            // console.log(JSON.stringify(metaModel, undefined, 2));
            
            wdisDb.meta().setMetaModel(modelName, metaModel);
            
            let modelStr = wdisDb.meta().modelLikePrisma(modelName);
            console.log(modelStr);

            expect(metaModel?.modelName).toBe(modelName);
        })

        it('Should Meta Show PK from MetaTest', async () => {
            const modelName = 'MetaTest';
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let pk = await metaRepo.pK(modelName, schemaName) as PKey;
            // console.log('PK', pk);

            expect(pk).toEqual(expect.objectContaining({
                columns: expect.arrayContaining(['id'])
            }));
        })
        
        it('Should Meta Show model schema from MetaTest', async () => {
            const modelName = 'MetaTest';
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let modelSchema = await metaRepo.modelSchema(modelName);
            console.log('modelSchema', modelSchema);

            expect(modelSchema).toEqual('public');
        })

        it('Should Meta Show All Table Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let tableNames = await metaRepo.tableNames(schemaName);
            // console.log(JSON.stringify(tableNames, undefined, 2));
            
            expect(tableNames).toContain('metatest3');
        })

        it('Should Meta Show All View Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let viewNames = await metaRepo.viewNames(schemaName);
            // console.log(JSON.stringify(viewNames, undefined, 2));
            
            expect(viewNames).toContain('vwmetatest');
        });

        it('Should Meta Show All Sequence Names', async () => {
            const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
            let sequenceNames = await metaRepo.sequenceNames(schemaName);
            // console.log(JSON.stringify(sequenceNames, undefined, 2));
            
            expect(sequenceNames).toContain('sqmetatest');
        });

        // it('Should Meta Generate MetaModel of a View', async () => {
        //     const metaRepo = wdisDb.resource.get(META_MODEL_REPO)() as MetaModelRepo;
        //     const viewName = 'VwMetaTest';
        //     let viewModel = await metaRepo.view(viewName, schemaName);
        //     console.log(JSON.stringify(viewModel, undefined, 2));
            
        //     expect(viewModel.modelName).toBe(viewName);
        // })
        


        it('Should run an select native query', async () => {
            let result = await wdisDb.resource.native('select * from MetaTest').run();
            // console.log('Native Select Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.arrayContaining([expect.objectContaining({name:'Teste Meta 3'})]));
        })
        
        it('Should select in model type view', async () => {
            let result = await wdisDb.select('VwMetaTest');
            // console.log('Select View VwMetaTest Result: '+JSON.stringify(result));
            expect(result).toEqual(expect.arrayContaining([expect.objectContaining({name:'Teste Meta 1'})]));
        })
    });
});