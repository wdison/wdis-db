export class QueryModel {
    modelName: string;
    model: any;
    fields: string[];
    fieldsValue: any[];
    criterias: any;
    sqlQuery: any;
    constructor(modelName:string, model:any, fields:string[], fieldsValue:any[], criterias:any, sqlQuery:any) {
        this.modelName = modelName
        this.model = model
        this.fields = fields
        this.fieldsValue = fieldsValue
        this.criterias = criterias
        this.sqlQuery = sqlQuery
    }
}