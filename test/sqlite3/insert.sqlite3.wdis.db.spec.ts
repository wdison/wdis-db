import { Insert, Resource } from "../../src";
import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb = Sqlite3TestUtil.getWdisDb();
let resourceUser:Resource = wdisDb.model('user', 'u');

const userModel = {
    id: 1,
    name: 'João',
    email: 'jhon@email.com',
    create: new Date()
}

describe('Sqlite3Insert', () => {
    beforeAll(async () => {
        let sqls = [
            `CREATE TABLE IF NOT EXISTS perfil (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "cd" TEXT, "name" TEXT, "create" DATE
            )`, 
            `CREATE TABLE IF NOT EXISTS user (
                "id" INTEGER PRIMARY KEY AUTOINCREMENT,
                "name" TEXT, "email" TEXT, id_perfil INTEGER, "create" DATE,
                FOREIGN KEY(id_perfil) REFERENCES perfil(id)
            )`, 
        ];
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
        
    });
    beforeEach(() => {

    });

    describe('when insert user', () => {

        it('Should insert User as columns and values', async () => {
            let insert = resourceUser
                .model('user','u')
                // `INSERT INTO user ("id", "name", "email", "id_perfil", "create") VALUES (1, 'Teste', 'test@test.com', 1, date())`
                .insert('name','email','id_perfil','create')
                .values('Col João teste', 'test@test.com', 1, new Date().toISOString());
            let renderedSql = insert.render();
            console.log(renderedSql);
            expect(renderedSql).toContain('user');
            expect((await insert.run())).toBe(null);
        })
        
        it('Should insert User as obj with keys and values', async () => {
            let userModel = {
                name:'Obj João teste',
                email:'test@test.com',
                id_perfil: 1,
                create: new Date().toISOString()
            };
            let insert = resourceUser
                .model('user','u')
                .insert(userModel);
            let renderedSql = insert.render();
            console.log(renderedSql);
            expect(renderedSql).toContain('user');
            expect((await insert.run())).toBe(null);
        })
        
        it('Should insert User as Arr with keys and values', async () => {
            let userModel1 = { name:'Arr1 João teste', email:'test@test.com', id_perfil: 1, create: new Date().toISOString()};
            let userModel2 = { name:'Arr2 João teste', email:'test@test.com', id_perfil: 1, create: new Date().toISOString()};
            let insert = resourceUser
                .model('user','u')
                .insert(userModel1, userModel2);
            let renderedSql = insert.render();
            console.log(renderedSql);
            expect(renderedSql).toContain('user');
            expect((await insert.run())).toBe(null);
        })
        
        it('Should insert User from select', async () => {
            let insert = resourceUser
                .model('user','u')
                .insert('name','email','id_perfil','create')
                // .values('Col João teste', 'test@test.com', 1, new Date().toISOString())
                .fromSubSelect("'SbQry João Test' as name", "'test@test.com' as email", 'id', 'date() as "create"').model('perfil',  'p')
                .backParent<Insert>()
                ;
            let renderedSql = insert.render();
            console.log('insert User from select: '+renderedSql);
            expect(renderedSql).toContain('user');
            expect((await insert.run())).toBe(null);
        })
        
    });
});