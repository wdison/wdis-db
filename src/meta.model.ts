
/**
    * Interfaces to Model      [@@id,  @@unique,   @@map,  @@check,    @@ignore,  @@index, @@schema]
    * Interfaces to Field      [@id,   @unique,    @map,   @check,     @ignore,   @index,  @default, @relation, @updatedAt]
    * Functions to interfaces  [increment(), cuid(), uuid(), sequence(), now(), dbgenerated()]
    */

export class MetaModel {
    modelName: string;
    type: string = ModelTypeEnum[ModelTypeEnum.Model];
    model: any;
    fields: FieldModel[] = [];
    interfaces: string[] = [];
    fieldsValue: any[];
    constructor(modelName: string, model: any, fields: (string | FieldModel)[], fieldsValue: any[] = []) {
        this.modelName = modelName
        this.model = model
        for (let field of fields) {
            if (typeof field == 'string') {
                this.fields.push(new FieldModel(field));
            } else {
                this.fields.push(field as FieldModel);
            }
        }
        this.fieldsValue = fieldsValue
    }
}

export class FieldModel {
    name: string;
    type: string;
    nullable: boolean;
    interfaces: any[]
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

export enum FieldTypeEnum {
    String = 'string', Int = 'int', Long = 'long', Float = 'float', Double = 'double', Bool = 'bool', Date = 'date', DateTime = 'datetime', Bytes = 'bytes'
}

export const fieldsTypes = Object.keys(FieldTypeEnum).map(item => item.toLowerCase()).filter((value, index, array) => {
    return array.indexOf(value) === index;
});

export enum ModelTypeEnum {
    Model, View, Enum
}