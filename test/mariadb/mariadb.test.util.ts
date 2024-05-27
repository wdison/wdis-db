import { ConfResource, REPO, WdisDb } from "../../src";

const confResource: ConfResource = {
    resource: 'mariadb',
    url: '127.0.0.1',
    options:{
        host: '127.0.0.1',
        port: '13306',
        user: 'root',
        password: 'testrootpassword',
        database: 'mariadb_test'
    }
};

export class MariaDbTestUtil {
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