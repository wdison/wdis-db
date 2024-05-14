import { FieldTypeEnum } from "../../meta.model";
import { SqlDelete } from "../../resource/query/impl/sql.delete";
import { Resource } from "../../resource/resource";

export class MySqlDelete extends SqlDelete {
    constructor(resource: Resource) {
        super(resource);
    }

    async run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:'+this.modelName+':delete'), {resource: this.resource, model: undefined, modelName:this.modelName, type:'delete'});
            let sqlRendered = this.render();
            let database = (this.resource.get('repo')()) as any;
            database.query(sqlRendered, this.valuesToQuery, (err:any, res:any, fields:any) => {
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
    
    parseType(type: string):string {
        // console.log('type: '+type);
        // console.log('FieldTypeEnum.String: '+FieldTypeEnum.String);
        
        let result:string|undefined = undefined;
        switch (type) {
            case FieldTypeEnum.String.toString():
                result = 'TEXT'
                break;
            case FieldTypeEnum.Int.toString():
                result = 'INTEGER'
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
                result = 'TEXT'
                break;
        }
        return result;
    }
}
