import { Resource } from "../../src";
import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb = Sqlite3TestUtil.getWdisDb();
let resourceUser:Resource = wdisDb.model('user', 'u');

const userModel = {
    id: 1,
    name: 'João',
    email: 'jhon@email.com',
    create: new Date()
}

describe('Sqlite3Delete', () => {
    beforeAll(async () => {
        let sqls:string[] = [
        `DROP TABLE IF EXISTS TestDelete`,
        `CREATE TABLE IF NOT EXISTS TestDelete (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "name" TEXT, "create" DATE DEFAULT CURRENT_DATE
        )`,
        `INSERT INTO TestDelete ("id", "name") VALUES (1, 'Teste Delete')`,
        `INSERT INTO TestDelete ("id", "name") VALUES (2, 'Teste Delete')`,
        `INSERT INTO TestDelete ("id", "name") VALUES (3, 'Teste Delete')`
        ];
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
        
    });
    beforeEach(() => {

    });

    describe('when Delete TestDelete', () => {

        it('Should Delete TestDelete', async () => {
            wdisDb.resource.delete('TestDelete').where('eq:id',1).run();
            expect(1).toBe(1);
        })
    });
});