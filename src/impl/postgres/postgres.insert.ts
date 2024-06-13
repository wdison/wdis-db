import { SqlInsert } from "../../resource/query/impl/sql.insert";
import { Resource } from "../../resource/resource";

export class PostgresInsert extends SqlInsert {
    constructor(resource:Resource){
        super(resource);
    }

    render(): string {
        this.valuesToQuery = [];
        let sqlQuery = 'Insert Into ';
        sqlQuery+=this.modelName;
        // sqlQuery+=('('+this.columns.map(col=>'"'+col+'"').join(', ')+')');
        sqlQuery+=('('+this.columns.map(col=>col).join(', ')+')');
        
        if(this.modeInsert == 'subquery'){
            sqlQuery+=this._subSelect?.render();
        }else{
            let idx = 1;
            sqlQuery+=' values ('+this._values.map((item)=>'$'+(idx++)).join(', ')+')';
        }
        
        return sqlQuery;
    }

    async run(): Promise<any>{
        return new Promise(async (accept, reject)=>{
            await this.resource.intercept(('wdisdb:'+this.modelName+':insert'), {resource: this.resource, model: {name: this.modelName, columns:this.columns,values:this._values}, modelName:this.modelName, type:'insert'});
            let sqlRendered = this.render();
            let repo = (this.resource.get('repo')()) as any;
            if(this.modeInsert!='objarray'){
                repo.query(sqlRendered, this._values, (err:any, res:any, fields:any)=>{
                    if(err){
                        reject(err);
                    }else{
                        accept(res);
                    }
                });
            }else{
                let arrayValues:any[] = [];
                let newValuesQuery = 'values '
                let idxParamPostgres = 1;
                this._values.forEach((row:any[], idx)=>{
                    if(idx!=0)newValuesQuery+=', ';
                    newValuesQuery+='(';
                    row.forEach((col, idxCol)=>{
                        if(idxCol!=0)newValuesQuery+=', ';
                        newValuesQuery+='$'+(idxParamPostgres++);
                        arrayValues.push(col);
                    });
                    newValuesQuery+=')';
                })
                sqlRendered = sqlRendered.replace(/values .*/i, newValuesQuery);
                // console.log('SQL ARRAY',sqlRendered);
                
                repo.query(sqlRendered, arrayValues, (err:any, res:any, fields:any)=>{
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