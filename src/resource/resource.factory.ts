import { ConfResource } from "../conf.resource";
import { MySqlResource } from "../impl/mysql/mysql.resource";
import { Resource } from "./resource";
import { Sqlite3Resource } from "./sqlite3/sqlite3.resource";

export class ResourceFactory {
    private static resources: { [key: string]: Resource } = {};
    static prepared: boolean = false;

    public static addResource(resource: Resource){
        this.resources[resource.getResourceName().toLowerCase()] = resource;
    }

    public static createResource(conf: ConfResource): Resource {
        let resource:Resource = <Resource>{};
        let resouceNames = Object.keys(this.resources);
        for (let resouceName of resouceNames) {
            if(conf.resource.toLowerCase()==resouceName){
                resource = this.resources[resouceName];
                resource.config(conf);
                return resource;
            }
        }
        throw new Error('Resource not found');
    }
}

if(!ResourceFactory.prepared) {
    ResourceFactory.addResource(new Sqlite3Resource());
    ResourceFactory.addResource(new MySqlResource());
    ResourceFactory.prepared = true;
}
