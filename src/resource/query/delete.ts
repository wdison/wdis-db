import { Resource } from "../resource";
import { Query } from "./query";
import { Runner } from "./runner";
import { Where } from "./where";

export class Delete extends Query implements Runner {
    modelName: string = '';
    alias?: string;
    protected _where?: Where;
    
    constructor(resource: Resource) {
        super(resource);
    }

    model(modelName:string, alias?:string): Delete{
        this.modelName = modelName;
        this.alias = alias;
        return this;
    }

    from(modelName:string, alias?:string): Delete{
        return this.model(modelName, alias);
    }

    render(): string { throw new Error("Method not implemented."); }
    run(): Promise<any> { throw new Error("Method not implemented."); }

    public where(...criteria: any): Delete {
        if (criteria.length == 2) {
            this.getWhere().criteria(criteria[0], criteria[1]);
        } else if (criteria.length > 2) {
            if (criteria.length % 2 == 0) {
                for (let i = 0; i < criteria.length; i++) {
                    this.getWhere().criteria(criteria[i], criteria[++i]);
                }
            } else {
                throw new Error('Criteria where invalid!');
            }
        } else if (criteria.length == 1) {
            let keys = Object.keys(criteria[0]);
            if (keys.length > 0) {
                keys.forEach((key: string) => {
                    this.getWhere().criteria(key, criteria[0][key]);
                })
            }
        } else {
            throw new Error('Criteria where invalid!');
        }
        return this;
    }
    getWhere() {
        if (!this._where) {
            this._where = (this.resource.get('where')()) as Where;
        }
        this._where.root(this);
        return this._where;
    }
}