import { Resource } from "../resource";
import { Join, JoinType } from "./join";
import { Query } from "./query";
import { ISelect, Select } from "./select";

export class SubSelect implements ISelect {
    resource?: Resource;
    protected _parent?: Query;
    protected _root?: Query;
    protected _select?: Select;
    modelName: string = '';
    alias?: string;

    constructor(modelName:string, alias:string){
        this.modelName = modelName;
        alias = alias;
    }
    
    setResource(resource:Resource){
        this.resource = resource;
        this._select = resource.get('select')() as Select;
        this._select.model(this.modelName, this.alias);
    }

    setParent(parent: Query) {
        this._parent = parent;
    }

    setRoot(root: Query){
        if(root){
            this._root = root;
            if(this._select)this._select._root = root;
        }
    }

    backParent<T>(): T {
        return <T>this._parent;
    }

    model(modelName: string, alias: string | undefined): SubSelect {
        this.modelName = modelName||this.modelName;
        this.alias = alias||this.alias;
        if(this._select) this._select.model(modelName, alias);
        return this;
    }
    from(modelName: string, alias: string | undefined): ISelect {
        return this.model(modelName, alias);
    }
    column(...column: string[]): ISelect {
        return <ISelect>(this._select?.column(...column));
    }
    join(otherModel:string | SubSelect, alias:string, joinType:JoinType=JoinType.LEFT): Join {
        return <Join>(this._select?.join(otherModel, alias, joinType));
    }
    where(...criteria: any): ISelect {
        return <ISelect>(this._select?.where(...criteria));
    }
    group(...column: string[]): ISelect {
        return <ISelect>(this._select?.group(...column));
    }
    order(...column: string[]): ISelect {
        return <ISelect>(this._select?.order(...column));
    }
    render(): string {
        return <string>(this._select?.render());
    }
    setIsCount(isCount:boolean): void {
        (this._select as Select).setIsCount(isCount);
    }

}