import { ConfResource } from "../conf.resource";
import { Insert, Native, QRY_INSERT, QRY_NATIVE, QRY_SELECT, QRY_UPDATE, SqlWhere, Update } from "../index";
import { Select } from "./query/select";
import { Resource } from "./resource";
import { QRY_WHERE } from "./resource.constants";

export class AbstractSqlResource extends Resource {
    constructor(){
        super();
        let _self = this;
        this.set(QRY_WHERE, ()=>new SqlWhere(_self));
    }

    sqlFunctions: { [key: string]: string } = {};
    public config(conf: ConfResource) {
        super.config(conf);
        // this.sqlFunctions['max']='max(?)';
        //Implementado pelo recurso especifico
    }

    public select(...column: any): Select {
        let select = (this.get(QRY_SELECT)()) as Select;
        select.model(this.modelName, this.modelAlias);
        if(column && column.length){
            column.forEach((col:string)=>{select.column(col)});
        }
        return select;
    }
    
    public insert(...column: string[]|{[key:string]:any}[]): Insert {
        let insert = (this.get(QRY_INSERT)()) as Insert;
        insert.model(this.modelName, this.modelAlias);
        insert.column(...column);
        return insert;
    }
    
    public update(model: { [key: string]: any; }): Update {
        let update = (this.get(QRY_UPDATE)()) as Update;
        update.model(this.modelName, this.modelAlias);
        update.setObjModel(model);
        return update;
    }

    public native(script: any): Native {
        let native = (this.get(QRY_NATIVE)(script)) as Native;
        return native;
    }
}