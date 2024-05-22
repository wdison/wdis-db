import { FieldModel, FieldTypeEnum, MetaModel } from "../../meta.model";
import { Resource } from "../resource";
import { META_MODEL_REPO } from "../resource.constants";
import { MetaModelRepo } from "./meta.model.repo";
import { ModelParse } from "./model.parse";

/*Unsupported("typeUnsupported")*/

export class MetaModelManager {
    private static models: { [key: string]: MetaModel } = {};
    resource: Resource;

    constructor(resource: Resource) {
        this.resource = resource;
    }

    public setMetaModel(modelName: string, metaModel: MetaModel): void {
        MetaModelManager.models[modelName] = metaModel;
    }

    public getMetaModel(modelName: string): MetaModel | undefined {
        return MetaModelManager.models[modelName];
    }

    public metaModel(modelName: string, model: any): MetaModel {
        let metaModelCache = MetaModelManager.models[modelName];
        if (metaModelCache) {
            return metaModelCache;
        }

        const fields: string[] = Object.keys(model);
        let fieldsModel: FieldModel[] = [];
        let fieldsValue: any[] = [];
        fields.forEach((key) => {
            let value = model[key];
            if (Array.isArray(value)) value = JSON.stringify(value);
            fieldsValue.push(value);
            let fieldName = key;
            let fieldType = this.getFieldType(value);
            let nullable = true;
            let interfaces = [];
            if (fieldName == 'id') {
                interfaces.push('@id');
                nullable = false;
            }
            fieldsModel.push(new FieldModel(fieldName, fieldType, nullable, interfaces));
        })
        const metaModel = new MetaModel(modelName, fieldsModel);
        this.setMetaModel(modelName, metaModel);
        return metaModel;
    }

    private getFieldType(value: any) {
        let t1 = typeof value;
        if (["string", "undefined"].includes(t1) || value instanceof String) {
            return FieldTypeEnum.String;
        } else if (t1 == 'boolean') {
            return FieldTypeEnum.Bool;
        } else if (value instanceof Date) {
            return FieldTypeEnum.Date;
        } else if (t1 == 'bigint') {
            return FieldTypeEnum.Int;
        } else if (t1 == 'number') {
            if (value % 1 != 0) {
                if (value < 999999999.9 && value > -999999999.9) return FieldTypeEnum.Float;
                else return FieldTypeEnum.Double;
            } else if (value < 999999999 && value > -999999999) return FieldTypeEnum.Int;
            else return FieldTypeEnum.Long;
        } else {
            return FieldTypeEnum.String;
        }
    }

    /**
     * Interfaces to Model      [@@id,  @@unique,   @@map,  @@check,    @@ignore,  @@index, @@schema]
     * Interfaces to Field      [@id,   @unique,    @map,   @check,     @ignore,   @index,  @default, @relation, @updatedAt]
     * Functions to interfaces  [increment(), cuid(), uuid(), sequence(), now(), dbgenerated()]
     * 
     * @id(map: String?, length: number?, sort: String?, clustered: Boolean?)
     * @relation(fields: [authorId], references: [id])
     */
    modelLikePrisma(modelName: string): string {
        let modelCache = MetaModelManager.models[modelName];
        if (modelCache) {
            let nameCapitalize = modelName.substring(0, 1).toUpperCase() + modelName.substring(1).toLowerCase();
            let strLike = modelCache.type + ' ' + nameCapitalize + ' {\n';
            modelCache.fields.forEach((fieldModel) => {
                if (typeof fieldModel == 'string') strLike += '\t' + fieldModel + '?\t string';
                else {
                    strLike += '\t' + fieldModel.name + (fieldModel.nullable ? '?' : '') + '\t' + (fieldModel.type.substring(0, 1).toUpperCase() + fieldModel.type.substring(1).toLowerCase())
                    if (fieldModel.interfaces.length > 0) {
                        strLike += '\t' + fieldModel.interfaces.join(' ');
                    }
                }
                strLike += '\n';
            })

            modelCache.interfaces.forEach((item) => {
                strLike += '\t' + item + '\n';
            });

            strLike += '}'
            return strLike;
        }
        return '';//return 'null';
    }

    parse(userTmpPrisma: string): MetaModel {
        const parsedMetaModel = new ModelParse().parse(userTmpPrisma);
        this.setMetaModel(parsedMetaModel.modelName, parsedMetaModel);
        return parsedMetaModel;
    }

    async fromResource(modelName: string, schema: string = ''): Promise<MetaModel | undefined> {
        const metaModelRepo = this.resource.get(META_MODEL_REPO)() as MetaModelRepo;
        return metaModelRepo.metaModel(modelName, schema);
    }
}