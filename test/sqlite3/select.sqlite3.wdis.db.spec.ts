import { WdisDb } from "../../src";
import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb: WdisDb = Sqlite3TestUtil.getWdisDb();

const model = {
    name: 'João',
    id: 1,
    email: 'jhon@email.com',
    create: new Date()
}

describe('Sqlite3Select', () => {
    beforeAll(async () => {
        let sqls = [
            `DROP TABLE IF EXISTS user`,
            `DROP TABLE IF EXISTS perfil`,
            `CREATE TABLE IF NOT EXISTS perfil (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "cd" TEXT, "name" TEXT, "create" DATE
            )`, 
            `INSERT INTO perfil ("id", "cd", "name", "create") VALUES (1, 'ADMIN', 'Administrator', date())`,
            `INSERT INTO perfil ("id", "cd", "name", "create") VALUES (2, 'ADMIN2', 'Administrator 2', DATE())`,
            `CREATE TABLE IF NOT EXISTS user (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "name" TEXT, "email" TEXT, id_perfil INTEGER, "create" DATE,
                FOREIGN KEY(id_perfil) REFERENCES perfil(id)
            )`, 
            `INSERT INTO user ("id", "name", "email", "id_perfil", "create") VALUES (1, 'Teste', 'test@test.com', 1, date())`
        ];
        
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    describe('when select user', () => {

        it('Should select User', async () => {
            let select = wdisDb.model('user', 'u').select().where('id', 1);
            expect(select.render()).toContain('user');
            expect((await select.unique())['id']).toBe(1);
        })

        it('Should select User using like', async () => {
            let select = wdisDb.model('perfil').select().where('lk:name', '2');
            console.log('Sql Rendered', select.render());

            expect(select.render()).toContain('perfil');
            const resUnique = await select.unique();
            console.log('Resultado Unico of perfil like:', resUnique);

            expect((resUnique)['id']).toBe(2);
        })
        
        it('Should select User Join Perfil', async () => {
            let select = wdisDb.model('user', 'u').select().where('u.id', 1)
                .join('perfil', 'p').on('u.id_perfil', 'p.id').backSelect();
            let renderedSql = select.render();
            console.log(renderedSql);
            
            expect(renderedSql).toContain('user');
            expect(renderedSql).toContain('perfil');
            expect(renderedSql).toContain('join');
            expect((await select.unique())['id']).toBe(1);
        })
    });
});