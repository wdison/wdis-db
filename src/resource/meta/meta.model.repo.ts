import { Check, Descendant, FKey, FieldModel, Index, MetaModel, PKey } from "../../meta.model";
import { Resource } from "../resource";

class ItemMetaRepo {
    metaModelRepo: MetaModelRepo;
    modelName: string;
    schema: string | undefined;
    constructor(metaModelRepo: MetaModelRepo, modelName: string, schema: string | undefined = undefined) {
        this.metaModelRepo = metaModelRepo;
        this.modelName = modelName;
        this.schema = schema;
    }
    backMetaRepo() {
        return this.metaModelRepo;
    }

    async modelSchema(): Promise<string> {
        const schema = await this.metaModelRepo.modelSchema(this.modelName);
        if (schema) this.schema = schema;
        return schema;
    }

    // metaModel(modelName: string, schema: string | undefined = undefined): MetaModel { throw new Error("Method not implemented."); }
    async table(): Promise<MetaModel> {
        return await this.metaModelRepo.table(this.modelName, this.schema);
    }
    async view(): Promise<MetaModel> {
        return this.metaModelRepo.view(this.modelName, this.schema);
    }
    async columns(): Promise<FieldModel[]> {
        return await this.metaModelRepo.columns(this.modelName, this.schema);
    }
    async pK(): Promise<PKey | undefined> {
        return this.metaModelRepo.pK(this.modelName, this.schema);
    }
    async fKs(): Promise<FKey[]> {
        return this.metaModelRepo.fKs(this.modelName, this.schema);
    }
    async idxs(): Promise<Index[]> {
        return this.metaModelRepo.idxs(this.modelName, this.schema);
    }
    async checks(): Promise<Check[]> {
        return this.metaModelRepo.checks(this.modelName, this.schema);
    }
    async descendants(): Promise<Descendant[]> {
        return this.metaModelRepo.descendants(this.modelName, this.schema);
    }
}

export class MetaModelRepo {
    resource: Resource;
    modelName: string = '';
    constructor(resource: Resource) {
        this.resource = resource;
    }

    fromItem(modelName: string, schema: string = ''): ItemMetaRepo {
        return new ItemMetaRepo(this, modelName, schema);
    }

    async modelSchema(modelName: string): Promise<string> { throw new Error("Method not implemented."); }

    async schemaNames(): Promise<string[]> { throw new Error("Method not implemented."); }
    async schemaName(): Promise<string> { throw new Error("Method not implemented."); }
    async modelNames(schema: string | undefined = undefined, types: ('table' | 'view')[] | undefined = undefined): Promise<string[]> {
        let modelNames: string[] = [];
        if (!types) {
            modelNames = modelNames.concat(await this.tableNames(schema));
            modelNames = modelNames.concat(await this.viewNames(schema));
        } else if (types.includes('table')) {
            modelNames = modelNames.concat(await this.tableNames(schema));
        } else if (types.includes('view')) {
            modelNames = modelNames.concat(await this.viewNames(schema));
        }
        return modelNames;
    }
    async metaModels(schema: string | undefined = undefined, types: ('table' | 'view')[] | undefined = undefined): Promise<MetaModel[]> {
        let models: MetaModel[] = [];
        const modelNames = await this.modelNames(schema, types);
        for (let modelName of modelNames) {
            let type = types && types.length == 1 ? types[0] : undefined;
            const metaModel = await this.metaModel(modelName, schema, type);
            if (metaModel) {
                models.push(metaModel);
            }
        }
        return models;
    }
    async metaModel(modelName: string, schema: string | undefined = undefined, type: 'table' | 'view' | undefined = undefined): Promise<MetaModel | undefined> {
        let metaModel: MetaModel | undefined = undefined;
        if (!type) {
            metaModel = await this.table(modelName, schema);
            if (!metaModel) {
                metaModel = await this.view(modelName, schema);
            }
        } else if (type == 'table') {
            metaModel = await this.table(modelName, schema);
        } else if (type == 'view') {
            metaModel = await this.view(modelName, schema);
        }
        return metaModel;
    }

    async tableNames(schema: string | undefined = undefined): Promise<string[]> { throw new Error("Method not implemented."); }
    async tables(schema: string | undefined = undefined): Promise<MetaModel[]> { return await this.metaModels(schema, ['table']); }
    async table(modelName: string, schema: string = ''): Promise<MetaModel> {

        const itemRepo = this.fromItem(modelName, schema);
        if (!schema) {
            schema = await itemRepo.modelSchema();
        }
        let fields: FieldModel[] = await itemRepo.columns();
        let pk: PKey | undefined = await itemRepo.pK();
        let fks: FKey[] = await itemRepo.fKs();
        let idxs: Index[] = await itemRepo.idxs();
        let checks: Check[] = await itemRepo.checks();
        let descendants: Descendant[] = await itemRepo.descendants();

        let metaModel = new MetaModel(modelName, fields, schema);
        metaModel.schema = schema;
        metaModel.pk = pk;
        metaModel.fks = fks;
        metaModel.idxs = idxs;
        metaModel.checks = checks;
        metaModel.descendants = descendants;

        if (pk && pk.columns.length > 1) {
            // @@id([firstName, lastName])
            metaModel.interfaces.push('@@id([' + pk.columns.join(',') + '])')
        }
        if (schema) {
            // @@schema("base")
            metaModel.interfaces.push('@@chema("' + schema + '")')
        }
        if (idxs && idxs.length > 0) {
            idxs.forEach(idx => {
                if (!idx.name && idx.unique) {
                    // @@unique([email, address.number])
                    metaModel.interfaces.push('@@unique([' + idx.columns.join(',') + '])');
                } else if (idx.name && idx.unique) {
                    // @@index([title, authorName], map: "My_Custom_Index_Name", unique: true)
                    metaModel.interfaces.push('@@index([' + idx.columns.join(',') + '], map:"' + idx.name + '", unique: true)');
                } else if (!idx.name) {
                    // @@index([title, authorName])
                    metaModel.interfaces.push('@@index([' + idx.columns.join(',') + '])');
                } else {
                    // @@index([title, authorName], map: "My_Custom_Index_Name")
                    metaModel.interfaces.push('@@index([' + idx.columns.join(',') + '], map:"' + idx.name + '")');
                }
            });
        }
        // @unique //Put it in field
        // author     User?  @relation(fields: [authorName], references: [name]) //to FK's

        return metaModel;
    }

    async viewNames(schema: string | undefined = undefined): Promise<string[]> { throw new Error("Method not implemented."); }
    async views(schema: string | undefined = undefined): Promise<MetaModel[]> { return await this.metaModels(schema, ['view']); }
    async view(modelName: string, schema: string | undefined = undefined): Promise<MetaModel> { throw new Error("Method not implemented."); }

    async sequenceNames(schema: string | undefined = undefined): Promise<string[]> { throw new Error("Method not implemented."); }

    async columns(modelName: string, schema: string | undefined = undefined): Promise<FieldModel[]> { throw new Error("Method not implemented."); }
    async pK(modelName: string, schema: string | undefined = undefined): Promise<PKey | undefined> { throw new Error("Method not implemented."); }
    async fKs(modelName: string, schema: string | undefined = undefined): Promise<FKey[]> { throw new Error("Method not implemented."); }
    async checks(modelName: string, schema: string | undefined = undefined): Promise<Check[]> { throw new Error("Method not implemented."); }
    async idxs(modelName: string, schema: string | undefined = undefined): Promise<Index[]> { throw new Error("Method not implemented."); }
    async descendants(modelName: string, schema: string | undefined = undefined): Promise<Descendant[]> { throw new Error("Method not implemented."); }

    normalizeColumnTypeName(typeName: string): string { throw new Error("Method not implemented."); }
    parseOnRemoveOrOnUpdate(onEventValue: string): 'none' | 'restrict' | 'null' | 'default' | 'cascade' {
        let result: 'none' | 'restrict' | 'null' | 'default' | 'cascade' = 'none';
        if (onEventValue) {
            switch (onEventValue) {
                case 'NO ACTION': break;
                case 'RESTRICT': result = 'restrict'; break;
                case 'SET NULL': result = 'null'; break;
                case 'SET DEFAULT': result = 'default'; break;
                case 'CASCADE': result = 'cascade'; break;
            }
        }
        return result;
    }
}