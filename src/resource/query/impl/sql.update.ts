import { Resource } from "../../resource";
import { Update } from "../update";

export class SqlUpdate extends Update {
    constructor(resource:Resource){
        super(resource);
    }

    render(): string {
        this.valuesToQuery = [];
        let columns = Object.keys(this.objModel);
        let sqlQuery = 'Update ';
        sqlQuery+=this.modelName;
        sqlQuery+=' set ';
        sqlQuery+=columns.map(col=>{
            const valToSet = this.objModel[col];
            if(valToSet=='NULL'){
                return '"'+col+'" = NULL';
            }
            this.addValueToQuery(valToSet); 
            return '"'+col+'" = ?';
        }).join(', ');
        
        const sqlWhere = super.getWhere().render();
        if(sqlWhere)sqlQuery+=' '+sqlWhere;
        
        return sqlQuery;
    }
}