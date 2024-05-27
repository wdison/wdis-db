import { REPO } from "../../src";
import { MySqlTestUtil } from "./mysql.test.util";

let wdisDb = MySqlTestUtil.getWdisDb();

describe('MySqlUpdate', () => {
    beforeAll(async () => {
        let sqls:string[] = [
        `DROP TABLE IF EXISTS UpdateTest`,
        `CREATE TABLE IF NOT EXISTS UpdateTest (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            name TEXT, dt_create DATE DEFAULT (CURRENT_DATE)
        )`,
        `INSERT INTO UpdateTest (id, name) VALUES (1, 'Teste Update 1')`,
        `INSERT INTO UpdateTest (id, name) VALUES (2, 'Teste Update 2')`,
        `INSERT INTO UpdateTest (id, name) VALUES (3, 'Teste Update 3')`
        ];
        for(let sql of sqls){
            await MySqlTestUtil.runSql(sql);
        }
        
    });
    beforeEach(() => {

    });

    afterAll(() => {
        MySqlTestUtil.getWdisDb().resource.get(REPO)().end();
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
                affectedRows: 1
            }));
        })
    });
});