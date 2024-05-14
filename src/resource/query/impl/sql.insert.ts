import { Resource } from "../../resource";
import { Insert } from "../insert";

export class SqlInsert extends Insert {
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
            sqlQuery+=' values ('+this._values.map((item)=>'?').join(', ')+')';
        }
        
        return sqlQuery;
    }
}