import { Database } from "sqlite3";
import { SqlSelect } from "../query/impl/sql.select";
import { Resource } from "../resource";

export class Sqlite3Select extends SqlSelect{
    constructor(resource:Resource){
        super(resource);
    }

    async unique(): Promise<any> {
        let listTmp = await this.list();
        if(!listTmp||listTmp.length==0) throw new Error('Empty!')
        else if(listTmp.length>1) throw new Error('Not Unique!');
        else return listTmp[0];
    }
    
    list():Promise<any[]> {
        let _self = this;
        let sql = this.render();
        let repo = (this.resource.get('repo')()) as Database;
        let result = new Promise<any[]>((accept, reject) => {
            repo.all(sql, _self.valuesToQuery, (err, rows) => {
                if (err) {
                    reject(`Falha ao selecionar registros de ${_self.modelName}. ` + err.message);
                } else {
                    _self.resource.intercept(('wdisdb:'+_self.modelName+':select'), {resource: _self.resource, model: rows, modelName:_self.modelName, type:'select'});
                    accept(rows);
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