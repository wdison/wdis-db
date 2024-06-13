import { FieldModel, MetaModel } from "../../meta.model";
import { Resource } from "../resource";
import { Query } from "./query";
import { Runner } from "./runner";

export class Create extends Query implements Runner {
    metaModel: MetaModel;

    constructor(resource: Resource, metaModel: MetaModel) {
        super(resource);
        this.metaModel = metaModel;
    }

    render(): string { throw new Error("Method not implemented.");}
    run(): Promise<any> { throw new Error("Method not implemented.");}
    parseType(field: FieldModel):string { throw new Error("Method not implemented.");}
}