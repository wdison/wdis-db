import { SqlWhere } from "../../resource/query/impl/sql.where";
import { Resource } from "../../resource/resource";

export class PostgresWhere extends SqlWhere{
    constructor(resource: Resource) {
        super(resource);
    }

    render(): string {
        let superRendered = super.render();
        let index = 1;
        const result = superRendered.replace(/\?/g, () => `$${index++}`);
        return result;
    }
}