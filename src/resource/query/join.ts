import { Render } from "../render";
import { Resource } from "../resource";
import { Query } from "./query";
import { Select } from "./select";
import { SubSelect } from "./subselect";
import { Where } from "./where";

export interface IJoin {
    on(): IJoin;
}

export enum JoinType {
    INNER, LEFT, RIGHT, FULL
}

export class Join implements IJoin, Render {
    resource: Resource;
    protected joinType: JoinType;
    protected modelName: string='';
    protected alias: string;
    protected subSelect?: SubSelect;
    protected _where: Where;
    protected _parent: Query;
    constructor(resource:Resource, parent: Query, model: string|SubSelect, alias:string, joinType: JoinType = JoinType.LEFT) {
        this.resource = resource;
        this._parent = parent;
        if(model instanceof SubSelect){
            this.subSelect = model as SubSelect;
        }else{
            this.modelName = model as string;
        }
        this.alias = alias;
        this.joinType = joinType;
        this._where = (this.resource.get('where')()) as Where;
    }
    
    on(...criteria:any): Join {
        if(criteria.length == 2){
            this._where.criteria(criteria[0], criteria[1]);
        }else if(criteria.length > 2){
            if(criteria.length % 2 == 0){
                for(let i = 0;i<criteria.length; i++){
                    this._where.criteria(criteria[i], criteria[++i]);
                }
            }
        }else if(criteria.length == 1){
            let keys = Object.keys(criteria[0]);
            if(keys.length>0){
                keys.forEach((key:string)=>{
                    this._where.criteria(key, criteria[0][key]);
                })
            }else{
                throw new Error('Criteria where invalid!');
            }
        }else{
            throw new Error('Criteria where invalid!');
        }
        return this;
    }

    backSelect():Select{
        return this._parent as Select;
    }

    root(query: Query):void{
        this._where.root(query);
    }
    render(): string {
        let sqlJoin = JoinType[this.joinType]+' join ';
        if(this.modelName){
            sqlJoin+=this.modelName
        }else{
            sqlJoin+='('+this.subSelect?.render()+')';
        }
        
        if(this.alias) sqlJoin+=' as ' + this.alias;

        let whereStr = this._where.render();
        if(whereStr){
            sqlJoin+=' '+whereStr.replace('where ', 'on ')
        }else{
            throw new Error('Empty ON clause');
        }

        return sqlJoin;
    }
}