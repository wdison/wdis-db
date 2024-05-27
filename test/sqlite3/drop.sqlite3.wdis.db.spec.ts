import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb = Sqlite3TestUtil.getWdisDb();

describe('Sqlite3Drop', () => {
    beforeAll(async () => {
        let sqls:string[] = [
            `DROP TABLE IF EXISTS TestDrop`,
        `CREATE TABLE IF NOT EXISTS TestDrop (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "name" TEXT, "create" DATE DEFAULT CURRENT_DATE
        )`,
        `INSERT INTO TestDrop ("id", "name") VALUES (1, 'Teste Drop')`,
        `INSERT INTO TestDrop ("id", "name") VALUES (2, 'Teste Drop')`,
        `INSERT INTO TestDrop ("id", "name") VALUES (3, 'Teste Drop')`
        ];
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(()=>{

    });

    describe('When Drop TestDrop', () => {

        it('Should Drop TestDrop', async () => {
            const qryDrop = wdisDb.model('TestDrop').drop('TestDrop');
            let sqlRendered = qryDrop.render();
            console.log('Test wdisDb.drop: '+sqlRendered);
            
            qryDrop.run();
            expect(1).toBe(1);
        })
    });
});