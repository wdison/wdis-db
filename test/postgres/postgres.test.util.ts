import { ConfResource, REPO, WdisDb } from "../../src";

const confResource: ConfResource = {
    resource: 'postgres',
    url: '127.0.0.1',
    options:{
        host: '127.0.0.1',
        port: '5432',
        user: 'testuser',
        password: 'testpassword',
        database: 'postgresdb_test'
    }
};

export class PostgresTestUtil {
    private static wdisDb:WdisDb;

    public static getWdisDb(){
        if(!this.wdisDb){
            this.wdisDb = new WdisDb(confResource);
        }
        return this.wdisDb;
    }

    static runSql(sql:string): Promise<any>{
        return new Promise(async (accept)=>{
            let repo = (this.getWdisDb().resource.get(REPO)()) as any;
            repo.query(sql, (err:any, rows:any, fields:any)=>{
                if(err){
                    console.log('running: '+sql);
                    console.error(err);
                }
                accept(undefined);
            });
        });
    }
}