import { Database } from "sqlite3";
import { SqlUpdate } from "../query/impl/sql.update";
import { Resource } from "../resource";

export class Sqlite3Update extends SqlUpdate {
    constructor(resource: Resource) {
        super(resource);
    }

    async run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:'+this.modelName+':update'), {resource: this.resource, model: this.objModel, modelName:this.modelName, type:'update'});

            let sqlRendered = this.render();
            let database = (this.resource.get('repo')()) as Database;
            database.run(sqlRendered, this.valuesToQuery, (err: any, res: any) => {
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

