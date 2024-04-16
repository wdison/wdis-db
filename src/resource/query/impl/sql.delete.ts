import { Resource } from "../../resource";
import { Delete } from "../delete";

export class SqlDelete extends Delete {
    constructor(resource:Resource){
        super(resource);
    }

    render(): string {
        if(!this.modelName) throw new Error('Model name is unknown|unknown!');
        
        this.valuesToQuery = [];
        let sqlQuery = 'Delete From ';
        sqlQuery+=this.modelName;
        
        const sqlWhere = this.getWhere().render();
        if(sqlWhere)sqlQuery+=' '+sqlWhere;
        
        return sqlQuery;
    }
}