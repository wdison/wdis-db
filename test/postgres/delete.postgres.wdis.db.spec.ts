import { REPO } from "../../src";
import { PostgresTestUtil } from "./postgres.test.util";

let wdisDb = PostgresTestUtil.getWdisDb();

const userModel = {
    id: 1,
    name: 'João',
    email: 'jhon@email.com',
    dt_create: new Date()
}

describe('PostgresDelete', () => {
    beforeAll(async () => {
        console.log('PostgresDelete beforeAll');
        
        let sqls:string[] = [
        `DROP TABLE IF EXISTS TestDelete`,
        `CREATE TABLE IF NOT EXISTS TestDelete (
            id SERIAL PRIMARY KEY,
            name TEXT, dt_create DATE DEFAULT CURRENT_DATE
        )`,
        `INSERT INTO TestDelete (id, name) VALUES (1, 'Teste Delete')`,
        `INSERT INTO TestDelete (id, name) VALUES (2, 'Teste Delete')`,
        `INSERT INTO TestDelete (id, name) VALUES (3, 'Teste Delete')`
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

    describe('when Delete TestDelete', () => {

        it('Should Delete TestDelete', async () => {
            const resDelete = await wdisDb.resource.delete('TestDelete').where('eq:id', 1).run();
            console.log(resDelete);
            expect(resDelete).toEqual(expect.objectContaining({rowCount:1}));
        })
    });
});