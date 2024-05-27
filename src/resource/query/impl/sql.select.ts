import { Resource } from "../../resource";
import { Select } from "../select";

export class SqlSelect extends Select {
    constructor(resource:Resource){
        super(resource);
    }

    async unique(): Promise<any> {
        let listTmp = await this.list();
        if(!listTmp||listTmp.length==0) throw new Error('Empty!')
        else if(listTmp.length>1) throw new Error('Not Unique!');
        else return listTmp[0];
    }

    render(): string {
        this.valuesToQuery = [];
        let sqlQuery = 'select ';
        if(this._isCount){
            sqlQuery+='count(*) as '+this._aliasCount;
        }else{
            sqlQuery+=(this.columns.join(', ') || (this.alias ? (this.alias+'.*'): '*'));
        }
        sqlQuery+=' from ';
        sqlQuery+=this.modelName;
        if(this.alias)sqlQuery+=' as '+(this.alias);
        
        if(this._joins.length)sqlQuery+=' '+(this._joins.map(join=>join.render()).join(' '));

        const sqlWhere = this.getWhere().render();
        if(sqlWhere)sqlQuery+=' '+sqlWhere;
        
        if(this._group.length>0)sqlQuery+=' group by '+(this._group.join(', '));
        if(!this._isCount) {
            if(this._sort.length>0)sqlQuery+=' order by '+(this._sort.join(', '));
            if((this._offset && this._offset > 0) || (this._limit && this._limit > 0)){
                sqlQuery = this.renderOffsetLimit(sqlQuery);
            }
        }
        return sqlQuery;
    }

    async count(): Promise<number> {
        this._isCount = true;
        let _count = await this.unique();
        this._isCount = false;
        // super.count();
        return _count[this._aliasCount];
    }
}