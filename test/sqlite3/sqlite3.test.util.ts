import { Database } from "sqlite3";
import { ConfResource, WdisDb } from "../../src";
import { TestUtil } from "../test.util";

const confResource: ConfResource = {
    resource: 'sqlite3',
    url: 'C:\\ambiente\\tmp\\wdis\\db\\sqlite3.db'
};

export class Sqlite3TestUtil {
    private static wdisDb:WdisDb;

    public static getWdisDb(){
        if(!this.wdisDb){
            this.wdisDb = new WdisDb(confResource);
        }
        return this.wdisDb;
    }

    static runSql(sql:string): Promise<any>{
        return new Promise(async (accept)=>{
            let sqliteDb = (this.getWdisDb().resource.get('repo')()) as Database;
            sqliteDb.run(sql, (err)=>{
                if(err){
                    console.log('running: '+sql);
                    console.error(err);
                }
                accept(undefined);
            });
        });
    }
}