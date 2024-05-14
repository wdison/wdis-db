import { SqlSelect } from "../../resource/query/impl/sql.select";
import { Resource } from "../../resource/resource";


export class MySqlSelect extends SqlSelect{
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
        let repo = (this.resource.get('repo')()) as any;
        let result = new Promise<any[]>((accept, reject) => {

            // connection.query('SELECT * FROM `books` WHERE `author` = ?', ['David'], function (error, results, fields) {
            //     // error will be an Error if one occurred during the query
            //     // results will contain the results of the query
            //     // fields will contain information about the returned results fields (if any)
            //   });

            repo.query(sql, _self.valuesToQuery, (err:any, rows:any, fields:any) => {
                // console.log('err:',err);
                // console.log('rows:',rows);
                // console.log('fields:',fields);
                
                if (err) {
                    reject(`Falha ao selecionar registros de ${_self.modelName}. ` + err.message);
                } else {
                    let resultLst = (<[]>rows).map(item=>Object.assign({}, item));
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