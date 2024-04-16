import { MetaModel } from "../../../meta.model";
import { Resource } from "../../resource";
import { Drop } from "../drop";

export class SqlDrop extends Drop {
    constructor(resource: Resource, metaModel: MetaModel){
        super(resource, metaModel);
    }

    render(): string {
        this.valuesToQuery = [];
        let sqlQuery = 'Drop Table ';
        sqlQuery+=this.metaModel.modelName;
        return sqlQuery;
    }
}