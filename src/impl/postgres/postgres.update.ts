import { SqlUpdate } from "../../resource/query/impl/sql.update";
import { Resource } from "../../resource/resource";

export class PostgresUpdate extends SqlUpdate {
    constructor(resource: Resource) {
        super(resource);
    }

    render(): string {
        let superRendered = super.render();
        let index = 1;
        const result = superRendered.replace(/(\$\d{1,}|\?)/g, () => `$${index++}`);
        return result;
    }

    async run(): Promise<any> {
        return new Promise(async (accept, reject) => {
            await this.resource.intercept(('wdisdb:'+this.modelName+':update'), {resource: this.resource, model: this.objModel, modelName:this.modelName, type:'update'});

            let sqlRendered = this.render();
            let database = (this.resource.get('repo')()) as any;
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

