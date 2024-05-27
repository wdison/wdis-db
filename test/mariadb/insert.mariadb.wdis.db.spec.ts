import { Insert, REPO } from "../../src";
import { MariaDbTestUtil } from "./mariadb.test.util";

let wdisDb = MariaDbTestUtil.getWdisDb();

const userModel = {
    id: 1,
    name: 'João',
    email: 'jhon@email.com',
    dt_create: new Date()
}

describe('MariaDbInsert', () => {
    beforeAll(async () => {
        console.log('MariaDbInsert beforeAll');
        
        let sqls = [
            `DROP TABLE IF EXISTS user_insert`,
            `DROP TABLE IF EXISTS perfil_insert`,
            `CREATE TABLE IF NOT EXISTS perfil_insert (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                cd TEXT, name TEXT, dt_create DATE
            )`, 
            `INSERT INTO perfil_insert (id, cd, name, dt_create) VALUES (1, 'ADMIN', 'Administrator', CURDATE())`,
            `INSERT INTO perfil_insert (id, cd, name, dt_create) VALUES (2, 'USER', 'User', CURDATE())`,
            `INSERT INTO perfil_insert (id, cd, name, dt_create) VALUES (3, 'VIEW', 'View', CURDATE())`,
            `CREATE TABLE IF NOT EXISTS user_insert (
                id INTEGER PRIMARY KEY AUTO_INCREMENT,
                name TEXT, email TEXT, id_perfil INTEGER, dt_create DATE,
                FOREIGN KEY(id_perfil) REFERENCES perfil_insert(id)
            )`, 
        ];
        for(let sql of sqls){
            await MariaDbTestUtil.runSql(sql);
        }
        
    });
    beforeEach(() => {

    });

    afterAll(() => {
        MariaDbTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('when insert user', () => {

        it('Should insert User as columns and values', async () => {
            let insert = wdisDb
                .model('user_insert','u')
                // `INSERT INTO user ("id", "name", "email", "id_perfil", "dt_create") VALUES (1, 'Teste', 'test@test.com', 1, date())`
                .insert('name','email','id_perfil','dt_create')
                .values('Col João teste', 'test@test.com', 1, new Date());
            let renderedSql = insert.render();
            console.log(renderedSql);
            expect(renderedSql).toContain('user');
            // expect((await insert.run())).toBe(null);
            expect((await insert.run())).toEqual(expect.objectContaining({
                affectedRows: 1
            }));
        })
        
        it('Should insert User as obj with keys and values', async () => {
            let userModel = {
                name:'Obj João teste',
                email:'test@test.com',
                id_perfil: 1,
                dt_create: new Date()
            };
            let insert = wdisDb
                .model('user_insert','u')
                .insert(userModel);
            let renderedSql = insert.render();
            console.log(renderedSql);
            expect(renderedSql).toContain('user_insert');
            expect((await insert.run())).toEqual(expect.objectContaining({
                affectedRows: 1
            }));
        })
        
        it('Should insert User as Arr with keys and values', async () => {
            let userModel1 = { name:'Arr1 João teste', email:'test@test.com', id_perfil: 1, dt_create: new Date()};
            let userModel2 = { name:'Arr2 João teste', email:'test@test.com', id_perfil: 1, dt_create: new Date()};
            let insert = wdisDb
                .model('user_insert','u')
                .insert(userModel1, userModel2);
            let renderedSql = insert.render();
            console.log(renderedSql);
            expect(renderedSql).toContain('user_insert');
            // expect((await insert.run())).toBe(null);
            expect((await insert.run())).toEqual(expect.objectContaining({
                affectedRows: 2
            }));
        })
        
        it('Should insert User from select', async () => {
            let insert = wdisDb
                .model('user_insert','u')
                .insert('name','email','id_perfil','dt_create')
                // .values('Col João teste', 'test@test.com', 1, new Date().toISOString())
                .fromSubSelect("'SbQry João Test' as name", "'test@test.com' as email", 'id', 'current_date as dt_create').model('perfil_insert',  'p')
                .backParent<Insert>()
                ;
            let renderedSql = insert.render();
            console.log('insert User from select: '+renderedSql);
            expect(renderedSql).toContain('user_insert');
            expect((await insert.run())).toEqual(expect.objectContaining({
                affectedRows: 3, //3 inserts in sql from top of this file
            }))
        })
    });
});