import { Render } from "../render";
import { Resource } from "../resource";
import { Query } from "./query";

export class Where implements Render {
    protected resource: Resource;
    protected _criteria:{[key:string]:any} = {}
    protected _rootQuery?: Query;
    
    constructor(resource: Resource) {
        this.resource = resource;
    }

    root(query: Query):void{
        this._rootQuery = query;
    }

    criteria(key:string, value:any) {
        this._criteria[key] = value;
    }

    render(): string {
        throw new Error("Method not implemented.");
    }
}
