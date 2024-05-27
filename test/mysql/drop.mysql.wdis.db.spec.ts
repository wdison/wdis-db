import { REPO } from "../../src";
import { MySqlTestUtil } from "./mysql.test.util";

let wdisDb = MySqlTestUtil.getWdisDb();

describe('MySqlDrop', () => {
    beforeAll(async () => {
        console.log('MySqlDrop beforeAll');

        let sqls:string[] = [
            `DROP TABLE IF EXISTS DropTest`,
        `CREATE TABLE IF NOT EXISTS DropTest (
            id INTEGER PRIMARY KEY AUTO_INCREMENT,
            name TEXT, dt_create DATE DEFAULT (CURRENT_DATE)
        )`,
        `INSERT INTO DropTest (id, name) VALUES (1, 'Teste Drop')`,
        `INSERT INTO DropTest (id, name) VALUES (2, 'Teste Drop')`,
        `INSERT INTO DropTest (id, name) VALUES (3, 'Teste Drop')`
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

    describe('When Drop DropTest', () => {

        it('Should Drop DropTest', async () => {
            const qryDrop = wdisDb.model('DropTest').drop('DropTest');
            let sqlRendered = qryDrop.render();
            console.log('Test wdisDb.drop: '+sqlRendered);
            
            const resDrop = await qryDrop.run();
            expect(resDrop).toEqual(expect.objectContaining({
                warningStatus: 0,
                info: ""
            }));
        })
    });
});