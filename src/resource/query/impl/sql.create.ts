import { MetaModel } from "../../../meta.model";
import { Resource } from "../../resource";
import { Create } from "../create";

export class SqlCreate extends Create {
    constructor(resource: Resource, metaModel: MetaModel){
        super(resource, metaModel);
    }

    render(): string {
        this.valuesToQuery = [];
        let sqlQuery = 'Create table ';
        sqlQuery+=this.metaModel.modelName;
        // sqlQuery+=('('+this.columns.map(col=>'"'+col+'"').join(', ')+')');
        
        // if(this.modeInsert == 'subquery'){
        //     sqlQuery+=this._subSelect?.render();
        // }else{
        //     sqlQuery+=' values ('+this._values.map((item)=>'?').join(', ')+')';
        // }
        
        return sqlQuery;
    }
}