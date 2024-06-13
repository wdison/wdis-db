import { FieldModel, FieldTypeEnum, MetaModel, ModelTypeEnum, fieldsTypes } from "../../meta.model";
import { SqlCreate } from "../../resource/query/impl/sql.create";
import { Resource } from "../../resource/resource";
import { REPO } from "../../resource/resource.constants";

export class PostgresCreate extends SqlCreate {
    constructor(resource: Resource, metaModel: MetaModel) {
        super(resource, metaModel);
    }

    render(): string {
        let metaModel: MetaModel = this.metaModel;
        if (metaModel.type == ModelTypeEnum[ModelTypeEnum.Model]) {
            let sqlQuery = 'Create Table ';
            sqlQuery += metaModel.modelName;
            sqlQuery += '(\n';
            let idxField = metaModel.fields.length-1;
            for(let field of metaModel.fields){
                // console.log(field.type,fieldsTypes);
                
                const fieldType = field.type.toLowerCase();
                if(fieldsTypes.includes(fieldType)) {
                    sqlQuery += '\t';
                    sqlQuery += field.name+'\t'+this.parseType(field);
                    sqlQuery += this.parseInterfaces(field);
                    
                    if(idxField--){
                        sqlQuery += ',';
                        sqlQuery += '\n';
                    }
                }
            }
            sqlQuery += '\n)';
            return sqlQuery;
            // sqlQuery += ('(' + this.columns.map(col => '"' + col + '"').join(', ') + ')');
        }
        throw new Error(`Type ${metaModel.type} not Implemented Yet!`);
    }
    parseInterfaces(field: FieldModel):string {
        let {interfaces, type} = field;
        type = type.toLowerCase();
        let result = '';
        for(let interf of interfaces){
            if(interf == '@id'){
                result+='\tprimary key'
            }else if(interf.includes('@default')){
                if(/^@default *\(increment *\( *\) *\)$/.test(interf)) {
                    // result+=' AUTO_INCREMENT'//Postgres uses SERIAL type as auto increment
                }else if(/^@default *\(now *\( *\) *\)$/.test(interf)){
                    result+=' DEFAULT '+(type==FieldTypeEnum.DateTime?"CURRENT_TIMESTAMP":"CURRENT_DATE");
                }else if(/^@default *\(".*"\)$/.test(interf)){
                    let defaultStr = interf.replace(/.*"(.*)".*/, '$1');
                    result+=" DEFAULT '"+defaultStr+"'";
                }
            }
        }
        return result;
    }

    async run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:'+this.metaModel.modelName+':create'), {resource: this.resource, model: this.metaModel, modelName:this.metaModel.modelName, type:'create'});
            let sqlRendered = this.render();
            let database = (this.resource.get(REPO)()) as any;
            database.query(sqlRendered, (err: any, res: any, fields:any) => {
                if (err) {
                    // console.log('Erro ao criar a tabela!');
                    reject(err);
                } else {
                    // console.log('Criou a tabela com sucesso!', res);
                    accept(res);
                }
            });
        })
    }
    
    parseType(field: FieldModel):string {
        let type = field.type.toLowerCase();
        // console.log('type: '+type);
        // console.log('FieldTypeEnum.String: '+FieldTypeEnum.String);
        let result:string|undefined = undefined;

        for(let interf of field.interfaces){
            if(interf.includes('@default')){
                if(/^@default *\(increment *\( *\) *\)$/.test(interf)) {
                    result='SERIAL';
                }
            }
        }
        if(!result){
            switch (type) {
                case FieldTypeEnum.String.toString():
                    result = 'VARCHAR(300)'
                    break;
                case FieldTypeEnum.Int.toString():
                    result = 'INT'
                    break;
                case FieldTypeEnum.Long.toString():
                    result = 'BIGINT'
                    break;
                case FieldTypeEnum.Float.toString():
                    result = 'FLOAT'
                    break;
                case FieldTypeEnum.Double.toString():
                    result = 'DOUBLE'
                    break;
                case FieldTypeEnum.Date.toString():
                    result = 'DATE'
                    break;
                case FieldTypeEnum.DateTime.toString():
                    result = 'DATETIME'
                    break;
                case FieldTypeEnum.Bool.toString():
                    result = 'BOOLEAN'
                    break;
                case FieldTypeEnum.Bytes.toString():
                    result = 'BLOB'
                    break;
                default:
                    result = 'VARCHAR(300)'
                    break;
            }
        }
        return result;
    }
}

