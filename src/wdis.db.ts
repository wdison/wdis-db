import { ConfResource } from './conf.resource';
import { MetaModel } from './meta.model';
import { MetaModelManager } from './resource/meta/meta.model.manager';
import { Create } from './resource/query/create';
import { Resource } from './resource/resource';
import { ResourceFactory } from './resource/resource.factory';

export class WdisDb {
    resource: Resource;

    constructor(/*Colocar configuração do Repositorio/BancoDeDados aqui */confResource: ConfResource){
        let resource:Resource = ResourceFactory.createResource(confResource);
        this.resource = resource;
        // wdisDbInternal = _selfWdisDbInternal = new WdisDbInternal({db:resource});
    }
    model(modelName: string, alias:string='') {
        return this.resource.model(modelName, alias);
    }
    public create(metaModelOrStrModel: MetaModel|string): Create {
        return this.resource.create(metaModelOrStrModel);
    }
    public meta():MetaModelManager {
        return this.resource.meta();
    }
    public insert(modelName:string, model:any):Promise<any> {
        return this.resource.model(modelName).insert(model).run();
    }
    public update(modelName:string, model:{[key:string]:any}, criteria:{[key:string]:any}|undefined=undefined):Promise<any> {
        return this.resource.model(modelName).update(model).where(criteria||{}).run();
    }
    // public async insertOrUpdate(modelName:string, model:any):Promise<any> {
    //     return await wdisDbInternal?.insertOrUpdate(modelName, model) as Promise<any>;
    // }
    // public async insertOrUpdateModels(modelName:string, models:any):Promise<any> {
    //     return await wdisDbInternal?.insertOrUpdateModels(modelName, models) as Promise<any>;
    // }
    // public async selectId(modelName:string, id:any, options:any):Promise<any> {
    //     return wdisDbInternal?.selectId(modelName, id, options) as Promise<any>;
    // }
    public async delete(modelName:string, criteria:{[key:string]:any}|undefined=undefined):Promise<any> {
        return this.resource.delete(modelName).where(criteria||{}).run();
    }
    public async select(modelName:string, criteria:{[key:string]:any}|undefined=undefined):Promise<any>{
        return this.resource.model(modelName).select().where(criteria||{}).list();
    }
    public on(keyEvent:string, callback:Function){
        this.resource.on(keyEvent, callback);
    }

    public static addResource(resource: Resource):void {
        ResourceFactory.addResource(resource);
    }
}
