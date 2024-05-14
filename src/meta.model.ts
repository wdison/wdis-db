
/**
    * Interfaces to Model      [@@id,  @@unique,   @@map,  @@check,    @@ignore,  @@index, @@schema]
    * Interfaces to Field      [@id,   @unique,    @map,   @check,     @ignore,   @index,  @default, @relation, @updatedAt]
    * Functions to interfaces  [increment(), cuid(), uuid(), sequence(), now(), dbgenerated()]
    */

export class MetaModel {
    modelName: string;
    schema: string='';
    type: string = ModelTypeEnum[ModelTypeEnum.Model];
    // model: any;
    fields: FieldModel[] = [];
    interfaces: string[] = [];

    pk?:PKey;
    fks:FKey[]=[];
    idxs:Index[]=[];
    checks:Check[]=[];
    descendants:Descendant[]=[];

    // fieldsValue: any[];
    constructor(modelName: string, fields: (string | FieldModel)[], schema: string='' ) {
        this.modelName = modelName
        this.schema = schema
        for (let field of fields) {
            if (typeof field == 'string') {
                this.fields.push(new FieldModel(field));
            } else {
                this.fields.push(field as FieldModel);
            }
        }
    }
}

export class FieldModel {
    name: string;
    type: string;
    nullable: boolean;
    pk: boolean=false;
    interfaces: any[];
    constructor(
        name: string,
        type: string = FieldTypeEnum.String,
        nullable: boolean = true,
        interfaces: any[] = []
    ) {
        this.name = name;
        this.type = type;
        this.nullable = nullable;
        this.interfaces = interfaces;
    }
}

export class RefKey {
    name:string;
    schema?:string;
    modelName:string;
    columns:string[]=[];
    refType: 'pk'|'fk'|'dc'|'idx'='fk';
    constructor(name:string,modelName:string, columns:string[]=[],schema:string|undefined=undefined){
        this.name = name;
        this.modelName = modelName;
        this.columns = columns;
        this.schema = schema;
    }
}

export class PKey extends RefKey{
    constructor(name:string,modelName:string, columns:string[]=[],schema:string|undefined=undefined){
        super(name, modelName, columns, schema);
        this.refType = 'pk';
    }
}

export class FKey extends RefKey{
    updateRule?:'none'|'restrict'|'null'|'default'|'cascade'='none';
    deleteRule?:'none'|'restrict'|'null'|'default'|'cascade'='none';
    refModelName: string='';
    refColumns: string[]=[];
    constructor(name:string,modelName:string, columns:string[]=[],schema:string|undefined=undefined){
        super(name, modelName, columns, schema);
        this.refType = 'fk';
    }
}

/** Descendant is the opposite of foreign key */
export class Descendant extends FKey{
    constructor(name:string,modelName:string, columns:string[]=[],schema:string|undefined=undefined){
        super(name, modelName, columns, schema);
        this.refType = 'dc';
    }
}

export class Index extends RefKey{
    unique:boolean=false;
    constructor(name:string,modelName:string, columns:string[]=[],schema:string|undefined=undefined){
        super(name, modelName, columns, schema);
        this.refType = 'idx';
    }
}

export class Check{
    schema?:string;
    modelName:string;
    name:string;
    condition:string;
    constructor(name:string,modelName:string, condition:string,schema:string|undefined=undefined){
        this.name = name;
        this.modelName = modelName;
        this.condition = condition;
        this.schema = schema;
    }
}

export enum FieldTypeEnum {
    String = 'string', Int = 'int', Long = 'long', Float = 'float', Double = 'double', Bool = 'bool', Date = 'date', DateTime = 'datetime', Bytes = 'bytes'
}

export const fieldsTypes = Object.keys(FieldTypeEnum).map(item => item.toLowerCase()).filter((value, index, array) => {
    return array.indexOf(value) === index;
});

export enum ModelTypeEnum {
    Model, View, Enum
}