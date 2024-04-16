import { WdisEvent } from "@wdis/event";
import { ConfResource } from "../conf.resource";
import { MetaModel } from "../meta.model";
import { MetaModelManager } from "./meta.model.manager";
import { Create } from "./query/create";
import { Delete } from "./query/delete";
import { Drop } from "./query/drop";
import { Insert } from "./query/insert";
import { Native } from "./query/native";
import { Select } from "./query/select";
import { Update } from "./query/update";
import { META_MODEL_MANAGER, QRY_DROP } from "./resource.constants";

export class Resource extends WdisEvent {
    constructor(){
        super();
        let _self = this;
        this.set(META_MODEL_MANAGER, ()=>new MetaModelManager(_self));
    }

    protected resourceName: string='';
    protected modelName: string='';
    protected modelAlias: string='';
    private resourceTools:{[key:string]: any}={};

    public getResourceName(): string {
        return this.resourceName;
    }
    public config(conf: ConfResource) {
        this.set('initConf', ()=>conf);
        //Implementado pelo recurso especifico(ex: sqlite3, oracle, ...)
    }
    public model(modelName:string, modelAlias:string=''):Resource{
        this.modelName = modelName;
        this.modelAlias = modelAlias;
        return this;
    }

    public get(key:string){
        return this.resourceTools[key];
    }
    public set(key:string, callback:Function){
        this.resourceTools[key] = callback;
    }
    
    public select(...column: any):  Select {throw new Error('Method not implemented!');}
    public update(model: {[key:string]:any}):  Update {throw new Error('Method not implemented!');}
    public insert(...columnOrModel: string[]|{[key:string]:any}[]):  Insert {throw new Error('Method not implemented!');}
    public delete(modelName: string|undefined=undefined, alias: string|undefined=undefined): Delete {
        let deleteQ = (this.get('delete')()) as Delete;
        deleteQ.from(modelName||this.modelName, alias||this.modelAlias);
        return deleteQ;
    }
    public native(script: any):     Native {throw new Error('Method not implemented!');}
    public create(metaModelOrStrModel: MetaModel|string): Create {
        let metaModel:MetaModel|undefined = undefined;
        if(typeof metaModelOrStrModel == 'string'){
            metaModel = (this.get(META_MODEL_MANAGER)() as MetaModelManager).parse(metaModelOrStrModel);
        }else{
            metaModel = metaModelOrStrModel;
        }
        const create = this.get('create')(metaModel) as Create;
        return create;
    }

    public drop(metaModelOrStrModel: MetaModel|string): Drop {
        let metaModel:MetaModel|undefined = undefined;
        if(typeof metaModelOrStrModel == 'string'){
            if(!metaModelOrStrModel.includes(' ')){
                metaModel = (this.get(META_MODEL_MANAGER)() as MetaModelManager).getMetaModel(metaModelOrStrModel);
                if(!metaModel) metaModel = {modelName:metaModelOrStrModel} as MetaModel;
            }else{
                metaModel = (this.get(META_MODEL_MANAGER)() as MetaModelManager).parse(metaModelOrStrModel);
            }
        }else{
            metaModel = metaModelOrStrModel;
        }
        const create = this.get(QRY_DROP)(metaModel) as Drop;
        return create;
    }
}