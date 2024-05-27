import { SqlSelect } from "../../resource/query/impl/sql.select";
import { Resource } from "../../resource/resource";


export class PostgresSelect extends SqlSelect{
    constructor(resource:Resource){
        super(resource);
    }
    
    async list():Promise<any[]> {
        let _self = this;
        let sql = this.render();
        let repo = (this.resource.get('repo')()) as any;
        let result = new Promise<any[]>((accept, reject) => {

            repo.query(sql, _self.valuesToQuery, (err:any, res:any, fields:any) => {
                // console.log('err:',err);
                // console.log('rows:', res?.rows);
                // console.log('fields:',fields);
                
                if (err) {
                    reject(`Falha ao selecionar registros de ${_self.modelName}. ` + err.message);
                } else {
                    let resultLst = (<[]>res.rows).map(item=>Object.assign({}, item));
                    _self.resource.intercept(('wdisdb:'+_self.modelName+':select'), {resource: _self.resource, model: resultLst, modelName:_self.modelName, type:'select'});
                    accept(resultLst);
                }
            });
        })
        return result;
    }

    protected renderOffsetLimit(preSqlRendered: string): string {
        let sqlRendered = preSqlRendered;
        // LIMIT <count> OFFSET <skip>
        if(this._limit && this._limit > 0) sqlRendered+= ' LIMIT '+this._limit;
        if(this._offset && this._offset > 0) sqlRendered+= ' OFFSET '+this._offset;
        return sqlRendered;
    }
}