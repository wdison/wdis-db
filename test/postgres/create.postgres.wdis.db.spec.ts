import { MetaModelManager } from "../../src/resource/meta/meta.model.manager";
import { META_MODEL_MANAGER, REPO } from "../../src/resource/resource.constants";
import { PostgresTestUtil } from "./postgres.test.util";

let wdisDb = PostgresTestUtil.getWdisDb();

const CreateUserModel = {
    id: 1,
    name: 'João',
    email: 'jhon@email.com',
    dt_create: new Date()
}

const createuserPrisma = `Model CreateUser {
    id      Int     @id @default(increment( ))
    name?   String  @default("Zé")
    email   String  @unique
    dt_create? Date    @default(now())
    @@schema("teste")
}`;

describe('PostgresCreate', () => {
    beforeAll(async () => {
        console.log('PostgresCreate beforeAll');
        let sqls:string[] = ['DROP TABLE IF EXISTS CreateUser'];
        for(let sql of sqls){
            await PostgresTestUtil.runSql(sql);
        }
    });
    beforeEach(() => {

    });

    afterAll(()=>{
        PostgresTestUtil.getWdisDb().resource.get(REPO)().end();
    });

    describe('When Create CreateUser', () => {

        it('Should Create CreateUser', async () => {
            let metaModel = wdisDb.meta().metaModel('CreateUser', CreateUserModel);
            console.log(JSON.stringify(metaModel, undefined, 2));
            const metaModelManager = wdisDb.resource.get(META_MODEL_MANAGER)() as MetaModelManager;
            const modelPrisma = metaModelManager.modelLikePrisma(metaModel.modelName);
            console.log(modelPrisma);
            let metaModelParsed = metaModelManager.parse(createuserPrisma);
            console.log(JSON.stringify(metaModelParsed, undefined, 2));
            console.log('From Parse: '+metaModelManager.modelLikePrisma(metaModelParsed.modelName));
            const createQuery = wdisDb.create(createuserPrisma);
            let sqlCreateRendered = createQuery.render();
            console.log(sqlCreateRendered);
            await createQuery.run();
            expect(1).toBe(1);
        })

        it('Should insert Array CreateUser after create table', async () => {
            let userModel1 = { name:'Arr1 João teste', email:'test@test.com', dt_create: new Date()};
            let userModel2 = { name:'Arr2 João teste', email:'test@test.com', dt_create: new Date()};
            let insert = wdisDb
                .model('CreateUser','u')
                .insert(userModel1, userModel2);
            let renderedSql = insert.render();
            console.log(renderedSql);//Array uses different redered sql
            expect(renderedSql).toContain('CreateUser');
            expect((await insert.run())).toEqual(expect.objectContaining({
                rowCount: 2
            }));
        })
    });
});