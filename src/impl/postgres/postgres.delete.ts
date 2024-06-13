import { SqlDelete } from "../../resource/query/impl/sql.delete";
import { Resource } from "../../resource/resource";

export class PostgresDelete extends SqlDelete {
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
}
