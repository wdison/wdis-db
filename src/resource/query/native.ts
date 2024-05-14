import { Resource } from "../resource";
import { Query } from "./query";
import { Runner } from "./runner";

export class Native extends Query implements Runner {
    nativeQry: string;
    constructor(resource:Resource, nativeQry:string) {
        super(resource);
        this.nativeQry = nativeQry;
    }
    run(): Promise<any> { throw new Error("Method not implemented."); }
}