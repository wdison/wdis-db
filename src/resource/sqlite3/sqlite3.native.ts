import { Database } from "sqlite3";
import { Native } from "../query/native";

export class Sqlite3Native extends Native{
    run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:native'), {resource: this.resource, nativeQry: this.nativeQry, type:'native'});
            let sqlRendered = this.nativeQry.trim();
            let database = (this.resource.get('repo')()) as Database;
            // console.log('Query native', sqlRendered);
            if(sqlRendered.toLowerCase().startsWith('select')){
                database.all(sqlRendered, this.valuesToQuery, (err, rows) => {
                    if (err) {
                        reject(err);
                    } else {
                        accept(rows);
                    }
                });
            }else{
                database.run(sqlRendered, this.valuesToQuery, (err: any, res: any) => {
                    if (err) {
                        console.log('Erro de nativo!', err);
                        reject(err);
                    } else {
                        
                        // console.log('Resultado de nativo!', res);
                        accept(res);
                    }
                });
            }
        })
    }
}