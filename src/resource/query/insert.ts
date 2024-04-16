import { Render } from "../render";
import { Resource } from "../resource";
import { Query } from "./query";
import { Runner } from "./runner";
import { SubSelect } from "./subselect";

export interface IInsert extends Render, Runner {
    model(modelName:string, alias:string|undefined): IInsert;
    into(modelName:string, alias:string|undefined): IInsert;
    column(...column:string[]):IInsert;
    fromSubSelect(...column:string[]): SubSelect;
    values(...values:any[]):IInsert;
    run():Promise<any>;
}

export class Insert extends Query implements IInsert {
    columns: string[]=[];
    _values: any[]=[];
    modeInsert: 'string'|'obj'|'objarray'|'subquery' = 'string';
    modelName: string='';
    alias: string | undefined;
    protected _subSelect: SubSelect|undefined;
    constructor(resource: Resource){
        super(resource);
    }
    
    model(modelName: string, alias: string | undefined): Insert {
        this.modelName = modelName;
        this.alias = alias;
        return this;
    }
    into(modelName: string, alias: string | undefined): Insert {
        return this.model(modelName, alias);
    }
    column(...column: string[]|{[key:string]:any}[]): Insert {
        let isStringCol=false, isObjCol=false;
        let colsInsertObj:string[]|undefined;
        let valuesInsertObj:any[][] = [];
        for(let col of column){
            if(typeof col == 'string'){
                isStringCol = true;
                this.modeInsert = 'string';
                this.columns.push(col);
            }else{
                this.modeInsert = 'obj';
                let insertObj = col;
                isObjCol = true;
                if(!colsInsertObj){//Verificando se é a primeira execução
                    colsInsertObj = Object.keys(insertObj);
                    for(let colObj of colsInsertObj){
                        this.columns.push(colObj);
                    }
                }
                let rowValues = [];
                for(let colObj of colsInsertObj){
                    rowValues.push(insertObj[colObj]);
                }
                valuesInsertObj.push(rowValues);
            }
        }

        if(isStringCol && isObjCol){
            throw new Error('String and Objects inserted together is invalid!');
        }else if(isObjCol){
            if(valuesInsertObj.length==1){
                this.values(...valuesInsertObj[0]);
            }else{
                this.modeInsert = 'objarray';
                this.values(...valuesInsertObj);
            }
        }

        return this;
    }
    fromSubSelect(...column:string[]): SubSelect{
        let subSelect = new SubSelect('','');
        subSelect.setResource(this.resource);
        subSelect.setParent(this);
        subSelect.column(...column);
        this._subSelect = subSelect;
        this.modeInsert = 'subquery';
        return subSelect;
    }
    values(...values: any[]): IInsert {
        this._values.push(...values);
        return this;
    }

    async run(): Promise<any>{
        throw new Error("Method run not implemented.");
    }
}