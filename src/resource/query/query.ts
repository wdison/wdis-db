import { Render } from "../render";
import { Resource } from "../resource";

export class Query implements Render {
    resource: Resource;
    protected valuesToQuery:any[]=[];
    
    constructor(resource:Resource){
        this.resource = resource;
    }
    addValueToQuery(valueToQuery:any){
        this.valuesToQuery.push(valueToQuery);
    }
    isColumn(checkValueColumn:any) {
        if(typeof checkValueColumn == 'string' && !checkValueColumn.includes(' ')){
            if(checkValueColumn.includes('.')) {
                return true;
            }
        }
        return false;
    }
    render(): string {
        throw new Error("Method not implemented.");
    }
}