import { SqlInsert } from "../../resource/query/impl/sql.insert";
import { Resource } from "../../resource/resource";

export class MySqlInsert extends SqlInsert {
    constructor(resource:Resource){
        super(resource);
    }

    async run(): Promise<any>{
        return new Promise(async (accept, reject)=>{
            await this.resource.intercept(('wdisdb:'+this.modelName+':insert'), {resource: this.resource, model: {name: this.modelName, columns:this.columns,values:this._values}, modelName:this.modelName, type:'insert'});
            let sqlRendered = this.render();
            let repo = (this.resource.get('repo')()) as any;
            if(this.modeInsert!='objarray'){
                repo.query(sqlRendered, this._values, (err:any, rows:any, fields:any)=>{
                    if(err){
                        reject(err);
                    }else{
                        accept(rows);
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
                // console.log('SQL ARRAY',sqlRendered);
                
                repo.query(sqlRendered, arrayValues, (err:any, rows:any, fields:any)=>{
                    if(err){
                        reject(err);
                    }else{
                        accept(rows);
                    }
                });
                // reject('Not implemented!');
            }
        })
    }
}