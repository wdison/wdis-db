import { Render } from "../render";
import { Resource } from "../resource";
import { Join, JoinType } from "./join";
import { Query } from "./query";
import { IResult } from "./result";
import { SubSelect } from "./subselect";
import { Where } from "./where";

export interface ISelect extends Render {
    model(modelName:string, alias:string|undefined): ISelect;
    from(modelName:string, alias:string|undefined): ISelect;
    column(...column:string[]):ISelect;
    join(otherModel:string | SubSelect, alias:string, joinType:JoinType): Join;
    where(...criteria:any):ISelect;
    group(...column:string[]):ISelect;
    order(...column:string[]):ISelect;
    render(): string;
}

export class Select extends Query implements ISelect, IResult {
    columns: string[]=[];
    protected _group: string[]=[];
    protected _sort: string[]=[];
    protected _where?: Where;
    modelName: string = '';
    alias?: string;
    protected _offset?: number;
    protected _limit?: number;
    protected _isCount: boolean=false;
    protected _aliasCount: string= 'countWdis';
    _joins: Join[] = [];
    _root?: Query;

    constructor(resource: Resource){
        super(resource);
    }

    model(modelName:string, alias?:string): Select{
        this.modelName = modelName;
        this.alias = alias;
        return this;
    }

    from(modelName:string, alias?:string): Select{
        return this.model(modelName, alias);
    }

    public column(...column:string[]): Select {
        this.columns.push(...column);
        return this;
    }

    join(otherModel:string | SubSelect, alias:string, joinType:JoinType=JoinType.LEFT): Join{
        let join = new Join(this.resource, this, otherModel, alias, joinType);
        join.root(this._root||this);
        this._joins.push(join);
        return join;
    }

    public where(...criteria:any): Select {
        if(criteria.length == 2){
            this.getWhere().criteria(criteria[0], criteria[1]);
        }else if(criteria.length > 2){
            if(criteria.length % 2 == 0){
                for(let i = 0;i<criteria.length; i++){
                    this.getWhere().criteria(criteria[i], criteria[++i]);
                }
            }
        }else if(criteria.length == 1){
            let keys = Object.keys(criteria[0]);
            if(keys.length>0){
                keys.forEach((key:string)=>{
                    this.getWhere().criteria(key, criteria[0][key]);
                })
            }else{
                throw new Error('Criteria where invalid!');
            }
        }else{
            throw new Error('Criteria where invalid!');
        }
        return this;
    }

    getWhere(){
        if(!this._where){
            this._where = (this.resource.get('where')()) as Where;
        }
        this._where.root(this._root||this);
        return this._where;
    }

    group(...column:string[]): Select{
        if(column && column.length) this._group.push(...column);
        return this;
    }

    order(...column:string[]): Select {
        if(column && column.length) this._sort.push(...column);
        return this;
    }

    offset(initRow:number): Select {
        this._offset = initRow;
        return this;
    }
    limit(maxRow:number): Select {
        this._limit = maxRow;
        return this;
    }
    
    render(): string {
        throw new Error("Method render not implemented.");
    }
    
    protected renderOffsetLimit(preSqlRendered:string): string {
        throw new Error("Method renderOffsetLimit not implemented.");
    }
    
    unique():Promise<any>{
        throw new Error("Method unique not implemented.");
    }

    list():Promise<any[]>{
        throw new Error('Method list not implemented.');
    }
    
    count():Promise<number>{
        throw new Error('Method count not implemented.');
    }

    setIsCount(isCount:boolean):void{
        this._isCount = isCount;
    }
}