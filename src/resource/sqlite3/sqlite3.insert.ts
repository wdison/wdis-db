import { Database } from "sqlite3";
import { SqlInsert } from "../query/impl/sql.insert";
import { Resource } from "../resource";

export class Sqlite3Insert extends SqlInsert {
    constructor(resource:Resource){
        super(resource);
    }

    async run(): Promise<any>{
        return new Promise((accept, reject)=>{
            let sqlRendered = this.render();
            let database = (this.resource.get('repo')()) as Database;
            if(this.modeInsert!='objarray'){
                database.run(sqlRendered, this._values, (res:any, err:any)=>{
                    if(err){
                        reject(err);
                    }else{
                        accept(res);
                    }
                });
            }else{
                let arrayValues:any[] = [];
                let newValuesQuery = 'values '
                this._values.forEach((row:any[], idx)=>{
                    if(idx!=0)newValuesQuery+=', ';
                    newValuesQuery+='(';
                    row.forEach((col, idxCol)=>{
                        if(idxCol!=0)newValuesQuery+=', ';
                        newValuesQuery+='?';
                        arrayValues.push(col);
                    });
                    newValuesQuery+=')';
                })
                sqlRendered = sqlRendered.replace(/values .*/i, newValuesQuery);
                // console.log(sqlRendered);
                
                database.run(sqlRendered, arrayValues, (res:any, err:any)=>{
                    if(err){
                        reject(err);
                    }else{
                        accept(res);
                    }
                });
                // reject('Not implemented!');
            }
        })
    }
}