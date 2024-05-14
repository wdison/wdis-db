import { Check, Descendant, FKey, FieldModel, Index, MetaModel, ModelTypeEnum, PKey } from "../../meta.model";
import { MetaModelRepo } from "../meta/meta.model.repo";
import { Resource } from "../resource";

export class Sqlite3MetaModelRepo extends MetaModelRepo {
    constructor(resource: Resource) {
        super(resource);
    }

    async schemaNames(): Promise<string[]> {
        return [];//Schema in sqlite is not very well defined
    }

    async schemaName(): Promise<string> {
        return '';//Schema in sqlite is not very well defined
    }

    async modelSchema(modelName: string): Promise<string> {
        return '';//Schema in sqlite is not very well defined
    }

    async tableNames(schema?: string | undefined): Promise<string[]> {
        return await this.tableOrViewNames('table', schema);
    }
    async viewNames(schema?: string | undefined): Promise<string[]> {
        return await this.tableOrViewNames('view', schema);
    }
    
    private async tableOrViewNames(type:'table'|'view', schema?: string | undefined) {
        let tableNames: string[] = [];
        // select type, name, tbl_name from sqlite_schema where type = 'table'
        let result = await this.resource.model('sqlite_schema').select('type', 'name', 'tbl_name').where('type', type).list();
        for (let item of result) {
            tableNames.push(item.name);
        }
        // console.log('Columns Result: ', result);
        // console.log(type+'Names Result: ', tableNames);
        return tableNames;
    }

    async view(modelName: string, schema?: string | undefined): Promise<MetaModel> {
        const itemRepo = this.fromItem(modelName, schema);
        if(!schema){
            schema = await itemRepo.modelSchema();
        }
        let fields:FieldModel[] = await itemRepo.columns();
        let metaModel = new MetaModel(modelName, fields, schema);
        metaModel.type = ModelTypeEnum[ModelTypeEnum.View];
        metaModel.schema = schema;
        return metaModel;
    }

    async columns(modelName: string, schema?: string | undefined): Promise<FieldModel[]> {
        let fields: FieldModel[] = [];
        let schemaPart = schema ? (",'" + schema + "'") : '';
        let result = await this.resource.select().model("PRAGMA_TABLE_INFO('" + modelName + schemaPart + "')").list();

        for (let item of result) {
            let fieldModel = new FieldModel(item.name, this.normalizeColumnTypeName(item.type), (item.pk || !item.notnull));
            fieldModel.pk = !!item.pk;
            if (fieldModel.pk) fieldModel.interfaces.push('@id');
            if (item.dflt_value) {
                if (['CURRENT_DATE', 'CURRENT_TIMESTAMP'].includes(item.dflt_value)) {
                    fieldModel.interfaces.push('@default(now())');
                } else {
                    let valueDefault = item.dflt_value as string;
                    if ((valueDefault).startsWith("'")) valueDefault = valueDefault.substring(1);
                    if ((valueDefault).endsWith("'")) valueDefault = valueDefault.substring(0, valueDefault.length - 1);
                    fieldModel.interfaces.push('@default("' + valueDefault + '"');
                }
            }
            fields.push(fieldModel);
        }
        // console.log('Columns Result: ', result);
        // console.log('Fields Result: ', fields);
        return fields;
    }

    async pK(modelName: string, schema?: string | undefined): Promise<PKey | undefined> {
        let schemaPart = schema ? (",'" + schema + "'") : '';
        let result = await this.resource.select().model("PRAGMA_TABLE_INFO('" + modelName + schemaPart + "')").where({ 'gt:pk': 0 }).list();
        // let result = await this.resource.select().model("PRAGMA_foreign_key_list('"+modelName+"')").list();
        let columns: string[] = [];
        result.forEach((item: { pk: number, name: string }) => {
            columns.push(item.name);
        });

        if (columns.length) {
            let pkName = ('PK' + modelName).toUpperCase();
            let pk = new PKey(pkName, modelName, columns, schema);
            // console.log('PK Columns Result: ', result);
            // console.log('PK Result: ', pk);
            return pk;
        }
        return undefined;
    }

    async fKs(modelName: string, schema?: string | undefined): Promise<FKey[]> {
        // SELECT * FROM PRAGMA_FOREIGN_KEY_LIST('SOMETABLE');
        let fks: FKey[] = [];
        let schemaPart = schema ? (",'" + schema + "'") : '';
        let result = await this.resource.select().model("PRAGMA_FOREIGN_KEY_LIST('" + modelName + schemaPart + "')").list();

        let fksObj: { [key: string]: FKey } = {};

        for (let item of result) {
            let fk = fksObj[item.table];
            if (!fk) {
                // ('FK' + (item.id_fk ? item.id_fk + 1 : '') + item.table_name + item.table_parent_name)
                let fkName = ('FK' + (item.id ? item.id + 1 : '') + modelName + item.table).toUpperCase();
                fk = new FKey(fkName, modelName, [], schema);
                fk.refModelName = item.table;
                fk.updateRule = this.parseOnRemoveOrOnUpdate(item.on_update);
                fk.deleteRule = this.parseOnRemoveOrOnUpdate(item.on_delete);
                fksObj[item.table] = fk;
            }
            fk.columns.push(item.from);
            fk.refColumns.push(item.to);
        }

        fks = Object.values(fksObj);
        // console.log('Select Result: ',result);
        // console.log('fks Result: ',fks);
        return fks;
    }

    async idxs(modelName: string, schema?: string | undefined): Promise<Index[]> {
        let idxs: Index[] = [];
        let result = await this.resource.native(`SELECT DISTINCT m.name as table_name, il.name as idx_name, ii.name as col_name, il."unique" as is_unique
        FROM sqlite_schema AS m,
             pragma_index_list(m.name) AS il,
             pragma_index_info(il.name) AS ii
       WHERE m.type='table' and m.name = '${modelName}'
       ORDER BY il.seq asc,ii.seqno`).run();

        let idxsObj: { [key: string]: Index } = {};

        for (let item of result) {
            let idxName = item.idx_name;
            let idx = idxsObj[idxName];
            if (!idx) {
                // table_name, idx_name, col_name, is_unique
                idx = new Index(idxName, modelName, [], schema);
                idx.unique = !!item.is_unique;
                idxsObj[idxName] = idx;
            }
            idx.columns.push(item.col_name);
        }

        idxs = Object.values(idxsObj);
        // console.log('Select Result: ',result);
        // console.log('idxs Result: ',idxs);
        return idxs;
    }

    async checks(modelName: string, schema?: string | undefined): Promise<Check[]> {
        let checks: Check[] = [];
        // let result = await this.resource.select().model("sqlite_schema").where({type:'table','name':modelName}).list();

        // let fksObj: { [key: string]: Check } = {};

        // for (let item of result) {
        //     let fk = fksObj[item.table];
        //     if (!fk) {
        //         let fkName = 'CK' + modelName+'_' + item.rootpage;

        //         fk = new Check(fkName, modelName, '', schema);
        //         fksObj[item.table] = fk;
        //     }
        // }

        // checks = Object.values(fksObj);
        // console.log('Select Result: ',result);
        // console.log('fks Result: ',checks);

        return checks;
    }

    async descendants(modelName: string, schema?: string | undefined): Promise<Descendant[]> {
        let children: Descendant[] = [];
        let result = await this.resource.native(`select m.name as table_name, f."table" as table_parent_name, "from", "to", on_update, on_delete, f.seq, f.id id_fk
        from sqlite_schema as m, pragma_foreign_key_list(m.name) as f
        where m.type = 'table' and f."table" = '${modelName}'
        order by m.name, f.seq`).run();

        let childrenObj: { [key: string]: Descendant } = {};

        for (let item of result) {
            let childName = ('FK' + (item.id_fk ? item.id_fk + 1 : '') + item.table_name + item.table_parent_name).toUpperCase();
            let child = childrenObj[childName];
            if (!child) {
                // table_name, table_parent_name, from, to, on_update, on_delete, seq
                child = new Descendant(childName, modelName, [], schema);
                child.refModelName = item.table_name;
                child.updateRule = this.parseOnRemoveOrOnUpdate(item.on_update);
                child.deleteRule = this.parseOnRemoveOrOnUpdate(item.on_delete);
                childrenObj[childName] = child;
            }
            child.columns.push(item.to);//Descendant is the opposite of foreign key
            child.refColumns.push(item.from);
        }

        children = Object.values(childrenObj);
        // console.log('Select Result: ',result);
        // console.log('Descendants Result: ',children);
        return children;
    }

    async sequenceNames(schema?: string | undefined): Promise<string[]> {
        // select name, seq from sqlite_sequence;
        let sequenceNames: string[] = [];
        let result = await this.resource.model('sqlite_sequence').select('name', 'seq').list();
        for (let item of result) {
            sequenceNames.push(item.name);
        }
        // console.log('Columns Result: ', result);
        // console.log('sequenceNames Result: ', sequenceNames);
        return sequenceNames;
    }

    normalizeColumnTypeName(typeName: string): string {
        return typeName;
    }
}