import { MetaModel } from "../../meta.model";
import { SqlDrop } from "../../resource/query/impl/sql.drop";
import { Resource } from "../../resource/resource";
import { REPO } from "../../resource/resource.constants";

export class MySqlDrop extends SqlDrop {
    constructor(resource: Resource, metaModel: MetaModel) {
        super(resource, metaModel);
    }

    async run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:'+this.metaModel.modelName+':drop'), {resource: this.resource, model: this.metaModel, modelName:this.metaModel.modelName, type:'drop'});
            let sqlRendered = this.render();
            let database = (this.resource.get(REPO)()) as any;
            database.query(sqlRendered, this.valuesToQuery, (err: any, res: any, fields:any) => {
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

