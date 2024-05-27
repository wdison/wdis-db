import { MetaModelManager } from "../../src/resource/meta/meta.model.manager";
import { META_MODEL_MANAGER } from "../../src/resource/resource.constants";
import { Sqlite3TestUtil } from "./sqlite3.test.util";

let wdisDb = Sqlite3TestUtil.getWdisDb();

const UserTmpModel = {
    id: 1,
    name: 'João',
    email: 'jhon@email.com',
    create: new Date()
}

const userTmpPrisma = `Model Usertmp {
    id      Int     @id @default(increment( ))
    name?   String  @default("Zé")
    email   String  @unique
    create? Date    @default(now())
    @@schema("teste")
}`;

describe('Sqlite3Create', () => {
    beforeAll(async () => {
        let sqls:string[] = ['DROP TABLE IF EXISTS Usertmp'];
        for(let sql of sqls){
            await Sqlite3TestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(()=>{

    });

    describe('When Create UserTmp', () => {

        it('Should Create UserTmp', async () => {
            let metaModel = wdisDb.meta().metaModel('UserTmp', UserTmpModel);
            console.log(JSON.stringify(metaModel, undefined, 2));
            const metaModelManager = wdisDb.resource.get(META_MODEL_MANAGER)() as MetaModelManager;
            const modelPrisma = metaModelManager.modelLikePrisma(metaModel.modelName);
            console.log(modelPrisma);
            let metaModelParsed = metaModelManager.parse(userTmpPrisma);
            console.log(JSON.stringify(metaModelParsed, undefined, 2));
            console.log('From Parse: '+metaModelManager.modelLikePrisma(metaModelParsed.modelName));
            const createQuery = wdisDb.create(userTmpPrisma);
            let sqlCreateRendered = createQuery.render();
            console.log(sqlCreateRendered);
            await createQuery.run();
            expect(1).toBe(1);
        })

        it('Should insert Array Usertmp after create table', async () => {
            let userModel1 = { name:'Arr1 João teste', email:'test@test.com', create: new Date().toISOString()};
            let userModel2 = { name:'Arr2 João teste', email:'test@test.com', create: new Date().toISOString()};
            let insert = wdisDb
                .model('Usertmp','u')
                .insert(userModel1, userModel2);
            let renderedSql = insert.render();
            console.log(renderedSql);//Array uses different redered sql
            expect(renderedSql).toContain('Usertmp');
            expect((await insert.run())).toBe(null);
        })
    });
});