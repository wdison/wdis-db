import { ConfResource } from "../conf.resource";
import { Insert, QRY_UPDATE, SqlWhere, Update } from "../index";
import { Select } from "./query/select";
import { Resource } from "./resource";

export class AbstractSqlResource extends Resource {
    constructor(){
        super();
        let _self = this;
        this.set('where', ()=>new SqlWhere(_self));
    }

    sqlFunctions: { [key: string]: string } = {};
    public config(conf: ConfResource) {
        super.config(conf);
        // this.sqlFunctions['max']='max(?)';
        //Implementado pelo recurso especifico
    }

    public select(...column: any): Select {
        let select = (this.get('select')()) as Select;
        select.model(this.modelName, this.modelAlias);
        if(column && column.length){
            column.forEach((col:string)=>{select.column(col)});
        }
        return select;
    }
    
    public insert(...column: string[]|{[key:string]:any}[]): Insert {
        let insert = (this.get('insert')()) as Insert;
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
}