import { ConfResource, WdisDb } from "../../src";

const confResource: ConfResource = {
    resource: 'mysql',
    url: '127.0.0.1',
    options:{
        host: '127.0.0.1',
        port: '23306',
        user: 'root',
        password: 'testrootpassword',
        database: 'mysqldb_test'
    }
};

export class MySqlTestUtil {
    private static wdisDb:WdisDb;

    public static getWdisDb(){
        if(!this.wdisDb){
            this.wdisDb = new WdisDb(confResource);
        }
        return this.wdisDb;
    }

    static runSql(sql:string): Promise<any>{
        return new Promise(async (accept)=>{
            let sqliteDb = (this.getWdisDb().resource.get('repo')()) as any;
            sqliteDb.query(sql, (err:any, rows:any, fields:any)=>{
                if(err){
                    console.log('running: '+sql);
                    console.error(err);
                }
                accept(undefined);
            });
        });
    }
}