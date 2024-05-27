import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb = Sqlite3TestUtil.getWdisDb();

describe('Sqlite3Update', () => {
    beforeAll(async () => {
        let sqls:string[] = [
        `DROP TABLE IF EXISTS TestUpdate`,
        `CREATE TABLE IF NOT EXISTS TestUpdate (
            "id" INTEGER PRIMARY KEY AUTOINCREMENT,
            "name" TEXT, "create" DATE DEFAULT CURRENT_DATE
        )`,
        `INSERT INTO TestUpdate ("id", "name") VALUES (1, 'Teste Delete')`,
        `INSERT INTO TestUpdate ("id", "name") VALUES (2, 'Teste Delete')`,
        `INSERT INTO TestUpdate ("id", "name") VALUES (3, 'Teste Delete')`
        ];
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
        
    });
    beforeEach(() => {

    });

    describe('when Update teste', () => {

        it('Should Update teste (Not yet implemented!)', async () => {
            let testUpdateTmp = {name:'Teste Update setted', create: 'NULL'};
            const qryUpdate = wdisDb.resource.model('TestUpdate', 'tu').update(testUpdateTmp).where('eq:id', 1);
            let sqlRendered = qryUpdate.render();
            console.log('Test wdisDb.update: '+sqlRendered);
            
            qryUpdate.run();
            expect(1).toBe(1);
        })
    });
});