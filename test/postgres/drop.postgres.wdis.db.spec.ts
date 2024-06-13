import { REPO } from "../../src";
import { PostgresTestUtil } from "./postgres.test.util";

let wdisDb = PostgresTestUtil.getWdisDb();

describe('PostgresDrop', () => {
    beforeAll(async () => {
        console.log('PostgresDrop beforeAll');

        let sqls:string[] = [
            `DROP TABLE IF EXISTS DropTest`,
        `CREATE TABLE IF NOT EXISTS DropTest (
            id SERIAL PRIMARY KEY,
            name TEXT, dt_create DATE DEFAULT CURRENT_DATE
        )`,
        `INSERT INTO DropTest (id, name) VALUES (1, 'Teste Drop')`,
        `INSERT INTO DropTest (id, name) VALUES (2, 'Teste Drop')`,
        `INSERT INTO DropTest (id, name) VALUES (3, 'Teste Drop')`
        ];
        for(let sql of sqls){
            await PostgresTestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(()=>{
        PostgresTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('When Drop DropTest', () => {

        it('Should Drop DropTest', async () => {
            const qryDrop = wdisDb.model('DropTest').drop('DropTest');
            let sqlRendered = qryDrop.render();
            console.log('Test wdisDb.drop: '+sqlRendered);
            
            const resDrop = await qryDrop.run();
            expect(resDrop).toEqual(expect.objectContaining({
                command: 'DROP'
            }));
        })
    });
});