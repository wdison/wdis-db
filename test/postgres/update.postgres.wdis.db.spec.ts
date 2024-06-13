import { REPO } from "../../src";
import { PostgresTestUtil } from "./postgres.test.util";

let wdisDb = PostgresTestUtil.getWdisDb();

describe('PostgresUpdate', () => {
    beforeAll(async () => {
        console.log('PostgresUpdate beforeAll');

        let sqls:string[] = [
        `DROP TABLE IF EXISTS UpdateTest`,
        `CREATE TABLE IF NOT EXISTS UpdateTest (
            id SERIAL PRIMARY KEY,
            name TEXT, dt_create DATE DEFAULT CURRENT_DATE
        )`,
        `INSERT INTO UpdateTest (id, name) VALUES (1, 'Teste Update 1')`,
        `INSERT INTO UpdateTest (id, name) VALUES (2, 'Teste Update 2')`,
        `INSERT INTO UpdateTest (id, name) VALUES (3, 'Teste Update 3')`
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

    describe('when Update teste', () => {

        it('Should Update UpdateTest', async () => {
            let testUpdateTmp = {name:'Teste Update setted', dt_create: 'NULL'};
            const qryUpdate = wdisDb.model('UpdateTest', 'ut').update(testUpdateTmp).where('eq:id', 1);
            let sqlRendered = qryUpdate.render();
            console.log('Test wdisDb.update: '+sqlRendered);
            
            const resUpdate = await qryUpdate.run();
            // console.log(resUpdate);
            
            expect(resUpdate).toEqual(expect.objectContaining({
                rowCount: 1
            }));
        })
    });
});