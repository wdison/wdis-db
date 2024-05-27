import { REPO, WdisDb } from "../../src";
import { TestUtil } from "../test.util";
import { PostgresTestUtil } from "./postgres.test.util";

let wdisDb: WdisDb = PostgresTestUtil.getWdisDb();


describe('PostgresSelect', () => {
    beforeAll(async () => {
        console.log('PostgresSelect beforeAll');
        await TestUtil.waitFor(500);
        console.log('after waitFor');
        
        let sqls = [
            `DROP TABLE IF EXISTS tb_user`,
            `DROP TABLE IF EXISTS perfil`,
            `CREATE TABLE perfil (
                id SERIAL PRIMARY KEY,
                cd VARCHAR(500), name VARCHAR(500), dt_create DATE
            )`,
            `INSERT INTO perfil (id, cd, name, dt_create) VALUES (1, 'ADMIN', 'Administrator', CURRENT_DATE)`,
            `INSERT INTO perfil (id, cd, name, dt_create) VALUES (2, 'ADMIN2', 'Administrator 2', CURRENT_DATE)`,
            `CREATE TABLE tb_user (
                id SERIAL PRIMARY KEY,
                name VARCHAR(500), email VARCHAR(500), id_perfil INT, dt_create DATE
                , FOREIGN KEY(id_perfil) REFERENCES perfil(id)
            )`,
            `INSERT INTO tb_user (id, name, email, id_perfil, dt_create) VALUES (1, 'Teste', 'test@test.com', 1, CURRENT_DATE)`,
            `INSERT INTO tb_user (id, name, email, id_perfil, dt_create) VALUES (2, 'Joia', 'joia@test.com', 2, CURRENT_DATE)`
        ];

        for (let sql of sqls) {
            await PostgresTestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(() => {
        PostgresTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('when select tb_user', () => {

        it('Should select Perfil', async () => {
            let select = wdisDb.model('perfil', 'p').select().where('id', '2');
            console.log('Sql Rendered', select.render());

            expect(select.render()).toContain('perfil');
            const resUnique = await select.unique();
            console.log('Resultado Unico of perfil id:', resUnique);

            expect(resUnique).toEqual(expect.objectContaining({id:2}));
        })
        
        it('Should select tb_User', async () => {
            let select = wdisDb.model('tb_user', 'u').select().where('id', 1);
            console.log('Sql Rendered', select.render());

            expect(select.render()).toContain('tb_user');
            const resUnique = await select.unique();
            console.log('Resultado Unico of tb_user id:', resUnique);

            expect(resUnique).toEqual(expect.objectContaining({id:1}));
        })
        
        it('Should select Perfil using like', async () => {
            let select = wdisDb.model('perfil').select().where('lk:name', '2');
            console.log('Sql Rendered', select.render());

            expect(select.render()).toContain('perfil');
            const resUnique = await select.unique();
            console.log('Resultado Unico of perfil like:', resUnique);

            expect(resUnique).toEqual(expect.objectContaining({id:2}));
        })

        it('Should select tb_User Join Perfil', async () => {
            let select = wdisDb.model('tb_user', 'u').select().where('u.id', 1)
                .join('perfil', 'p').on('u.id_perfil', 'p.id').backSelect();
            let renderedSql = select.render();
            console.log(renderedSql);

            expect(renderedSql).toContain('tb_user');
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