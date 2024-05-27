import { REPO, WdisDb } from "../../src";
import { MySqlTestUtil } from "./mysql.test.util";

let wdisDb: WdisDb = MySqlTestUtil.getWdisDb();


describe('MysqlSelect', () => {
    beforeAll(async () => {
        let sqls = [
            `DROP TABLE IF EXISTS user`,
            `DROP TABLE IF EXISTS perfil`,
            `CREATE TABLE perfil (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                cd VARCHAR(500), name VARCHAR(500), dt_create DATE
            )`,
            `INSERT INTO perfil (id, cd, name, dt_create) VALUES (1, 'ADMIN', 'Administrator', CURDATE())`,
            `INSERT INTO perfil (id, cd, name, dt_create) VALUES (2, 'ADMIN2', 'Administrator 2', CURDATE())`,
            `CREATE TABLE user (
                id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
                name VARCHAR(500), email VARCHAR(500), id_perfil INT, dt_create DATE
                , FOREIGN KEY(id_perfil) REFERENCES perfil(id)
            )`,
            `INSERT INTO user (id, name, email, id_perfil, dt_create) VALUES (1, 'Teste', 'test@test.com', 1, CURDATE())`,
            `INSERT INTO user (id, name, email, id_perfil, dt_create) VALUES (2, 'Joia', 'joia@test.com', 2, CURDATE())`
        ];

        for (let sql of sqls) {
            await MySqlTestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(() => {
        MySqlTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('when select user', () => {

        it('Should select Perfil', async () => {
            let select = wdisDb.model('perfil', 'p').select().where('id', 1);
            console.log('Sql Rendered', select.render());

            expect(select.render()).toContain('perfil');
            const resUnique = await select.unique();
            console.log('Resultado Unico of perfil id:', resUnique);

            expect((resUnique)['id']).toBe(1);
        })
        
        it('Should select User', async () => {
            let select = wdisDb.model('user', 'u').select().where('id', 1);
            console.log('Sql Rendered', select.render());

            expect(select.render()).toContain('user');
            const resUnique = await select.unique();
            console.log('Resultado Unico of user id:', resUnique);

            expect((resUnique)['id']).toBe(1);
        })
        
        it('Should select Perfil using like', async () => {
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
            const resUnique = await select.unique();
            console.log('Resultado Unico no join:', resUnique);
            expect(resUnique).toEqual(expect.objectContaining({
                id: 1,//check value
                name: 'Teste',//check value
                email: expect.any(String)//check type
            }))
        })
    });
});