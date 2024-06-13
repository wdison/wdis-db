import { Native } from "../../resource/query/native";
import { REPO } from "../../resource/resource.constants";

export class PostgresNative extends Native{
    run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:native'), {resource: this.resource, nativeQry: this.nativeQry, type:'native'});
            let sqlRendered = this.nativeQry.trim();
            let database = (this.resource.get(REPO)()) as any;
            database.query(sqlRendered, this.valuesToQuery, (err: any, res: any, fields:any) => {
                if (err) {
                    reject(err);
                } else {
                    if(res.command=='SELECT'){
                        accept(res.rows);
                    }else{
                        accept(res);
                    }
                }
            });
        })
    }
}