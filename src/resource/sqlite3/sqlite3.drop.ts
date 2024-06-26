import { Database } from "sqlite3";
import { MetaModel } from "../../meta.model";
import { SqlDrop } from "../query/impl/sql.drop";
import { Resource } from "../resource";

export class Sqlite3Drop extends SqlDrop {
    constructor(resource: Resource, metaModel: MetaModel) {
        super(resource, metaModel);
    }

    async run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:'+this.metaModel.modelName+':drop'), {resource: this.resource, model: this.metaModel, modelName:this.metaModel.modelName, type:'drop'});
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

