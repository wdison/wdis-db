import { Check, Descendant, FKey, FieldModel, FieldTypeEnum, Index, MetaModel, ModelTypeEnum, PKey } from "../../meta.model";
import { MetaModelRepo } from "../../resource/meta/meta.model.repo";
import { Resource } from "../../resource/resource";

export class MySqlMetaModelRepo extends MetaModelRepo {
    constructor(resource: Resource) {
        super(resource);
    }

    async schemaNames(): Promise<string[]> {
        return [];//Schema in sqlite is not very well defined
    }

    async schemaName(): Promise<string> {
        const selectQry = this.resource.native('select DATABASE() as schemaName');
        let result = await selectQry.run();
        let schemaName = result && result.length ? result[0].schemaName : '';
        // console.log('Columns Result: ', result);
        // console.log('Schema Corrente Result:',schemaName);
        return schemaName;
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

    private async tableOrViewNames(type: 'table' | 'view', schema?: string | undefined) {
        let tableNames: string[] = [];
        let criteria: any = {};
        if (type == 'table') criteria['TABLE_TYPE'] = 'BASE TABLE';
        if (type == 'view') criteria['TABLE_TYPE'] = 'VIEW';
        if (schema) criteria['TABLE_SCHEMA'] = schema;

        let result = await this.resource.model('information_schema.tables', 't')
            .select('TABLE_NAME as table_name', 'TABLE_TYPE table_type').where(criteria).list();
        for (let item of result) {
            tableNames.push(item.table_name);
        }
        // console.log('Columns Result: ', result);
        // console.log(type+'Names Result: ', tableNames);
        return tableNames;
    }

    async view(modelName: string, schema?: string | undefined): Promise<MetaModel> {
        const itemRepo = this.fromItem(modelName, schema);
        if (!schema) {
            schema = await itemRepo.modelSchema();
        }
        let fields: FieldModel[] = await itemRepo.columns();
        let metaModel = new MetaModel(modelName, fields, schema);
        metaModel.type = ModelTypeEnum[ModelTypeEnum.View];
        metaModel.schema = schema;
        return metaModel;
    }

    async columns(modelName: string, schema?: string | undefined): Promise<FieldModel[]> {
        let fields: FieldModel[] = [];
        let criteria: any = { 'TABLE_NAME': modelName };
        if (schema) criteria['TABLE_SCHEMA'] = schema;

        let result = await this.resource.model('information_schema.columns', 'c')
            // .select()
            .select('COLUMN_NAME as name', 'DATA_TYPE as type', 'IS_NULLABLE as isNull', 'COLUMN_KEY as pk',
                'COLUMN_DEFAULT as dflt_value', 'CHARACTER_MAXIMUM_LENGTH as cLength', 'NUMERIC_PRECISION as nPrecision', 'COALESCE(NUMERIC_SCALE, DATETIME_PRECISION) as scale'
            )
            .order('ORDINAL_POSITION')
            .where(criteria).list();

        for (let item of result) {
            item.isNull = item.isNull == 'YES' ? true : false;
            item.pk = item.pk == 'PRI' ? true : false;
            let fieldModel = new FieldModel(item.name, this.normalizeColumnTypeName(item.type), (item.pk || item.isNull));
            fieldModel.pk = !!item.pk;
            if (fieldModel.pk) fieldModel.interfaces.push('@id');
            if (item.cLength) fieldModel.interfaces.push('@length(' + item.cLength + ')');
            if (item.nPrecision) fieldModel.interfaces.push('@precision(' + item.nPrecision + ')');
            if (item.scale) fieldModel.interfaces.push('@scale(' + item.scale + ')');
            if (item.dflt_value) {
                if (['curdate()', 'CURRENT_DATE', 'CURRENT_TIMESTAMP'].includes(item.dflt_value)) {
                    fieldModel.interfaces.push('@default(now())');
                } else {
                    let valueDefault = item.dflt_value as string;
                    if ((valueDefault).startsWith("'")) valueDefault = valueDefault.substring(1);
                    if ((valueDefault).endsWith("'")) valueDefault = valueDefault.substring(0, valueDefault.length - 1);
                    fieldModel.interfaces.push('@default("' + valueDefault + '")');
                }
            }
            fields.push(fieldModel);
        }
        // console.log('Columns Result: ', result);
        // console.log('Fields Result: ', fields);
        return fields;
    }

    async pK(modelName: string, schema?: string | undefined): Promise<PKey | undefined> {
        let schemaPart = schema ?  ` and t.table_schema='${schema}'` : '';

        let result = await this.resource.native(`
        SELECT k.COLUMN_NAME as name FROM information_schema.table_constraints t JOIN information_schema.key_column_usage k USING(constraint_name,table_schema,table_name)
        WHERE t.constraint_type='PRIMARY KEY' AND t.table_name='${modelName}' ${schemaPart}
        `).run();
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

// Evandro de Murilo
// Jonas 

    async fKs(modelName: string, schema?: string | undefined): Promise<FKey[]> {
        // SELECT * FROM PRAGMA_FOREIGN_KEY_LIST('SOMETABLE');
        let fks: FKey[] = [];
        let schemaPart = schema ? ("AND t.TABLE_SCHEMA = '" + schema + "'") : '';
        
        let result = await this.resource.native(`
        SELECT 
            t.CONSTRAINT_NAME as fkName, 
            k.REFERENCED_TABLE_NAME as refTable, 
            k.COLUMN_NAME as colFrom,
            k.REFERENCED_COLUMN_NAME as colTo,
            r.UPDATE_RULE as onUpdate,
            r.DELETE_RULE as onDelete
        FROM information_schema.table_constraints t 
        JOIN information_schema.key_column_usage k 
            USING (constraint_name, table_schema, table_name)
        JOIN information_schema.referential_constraints r 
            ON t.CONSTRAINT_NAME = r.CONSTRAINT_NAME 
            AND t.TABLE_SCHEMA = r.CONSTRAINT_SCHEMA
        WHERE t.CONSTRAINT_TYPE = 'FOREIGN KEY' 
            AND t.TABLE_NAME = '${modelName}' ${schemaPart}
        ORDER BY t.CONSTRAINT_NAME, k.ORDINAL_POSITION
        `).run();

        let fksObj: { [key: string]: FKey } = {};

        for (let item of result) {
            let fk = fksObj[item.fkName];
            if (!fk) {
                let fkName = item.fkName;
                fk = new FKey(fkName, modelName, [], schema);
                fk.refModelName = item.refTable;
                fk.updateRule = this.parseOnRemoveOrOnUpdate(item.onUpdate);
                fk.deleteRule = this.parseOnRemoveOrOnUpdate(item.onDelete);
                fksObj[fkName] = fk;
            }
            fk.columns.push(item.colFrom);
            fk.refColumns.push(item.colTo);
        }

        fks = Object.values(fksObj);
        // console.log('Select Result: ',result);
        // console.log('fks Result: ',fks);
        return fks;
    }

    async idxs(modelName: string, schema?: string | undefined): Promise<Index[]> {
        let idxs: Index[] = [];
        let schemaPart = schema ? ("AND s.TABLE_SCHEMA = '" + schema + "'") : '';

        let result = await this.resource.native(`
        SELECT 
            INDEX_NAME as idxName,
            NON_UNIQUE as isNoUnique,
            COLUMN_NAME as colName,
            SEQ_IN_INDEX
        FROM 
            information_schema.STATISTICS s
        WHERE 
            s.TABLE_NAME = '${modelName}'
            ${schemaPart}
        ORDER BY INDEX_NAME,SEQ_IN_INDEX
        `).run();

        let idxsObj: { [key: string]: Index } = {};

        for (let item of result) {
            let idxName = item.idxName;
            let idx = idxsObj[idxName];
            if (!idx) {
                // table_name, idxName, colName, isUnique
                idx = new Index(idxName, modelName, [], schema);
                idx.unique = !item.isNoUnique;//0=Unique;1=NoUnique
                idxsObj[idxName] = idx;
            }
            idx.columns.push(item.colName);
        }

        for(let idxName in idxsObj){
            if(idxName=='PRIMARY' || idxsObj[idxName].columns.includes(idxName)) {
                delete idxsObj[idxName];
            }
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

        let schemaPart = schema ? ("AND k.REFERENCED_TABLE_SCHEMA = '" + schema + "'") : '';

        let result = await this.resource.native(`
        
        SELECT 
            t.CONSTRAINT_NAME as fkName, 
            k.TABLE_NAME as tableName, 
            k.REFERENCED_TABLE_NAME as refTable, 
            k.COLUMN_NAME as colFrom,
            k.REFERENCED_COLUMN_NAME as colTo,
            r.UPDATE_RULE as onUpdate,
            r.DELETE_RULE as onDelete
        FROM information_schema.table_constraints t 
        JOIN information_schema.key_column_usage k 
            USING (constraint_name, table_schema, table_name)
        JOIN information_schema.referential_constraints r 
            ON t.CONSTRAINT_NAME = r.CONSTRAINT_NAME 
            AND t.TABLE_SCHEMA = r.CONSTRAINT_SCHEMA
        WHERE t.CONSTRAINT_TYPE = 'FOREIGN KEY' 
            AND k.REFERENCED_TABLE_NAME = '${modelName}' 
            ${schemaPart}
        ORDER BY t.CONSTRAINT_NAME, k.ORDINAL_POSITION;
        
        `).run();

        let childrenObj: { [key: string]: Descendant } = {};

        for (let item of result) {
            let childName = item.fkName;
            let child = childrenObj[childName];
            if (!child) {
                // table_name, table_parent_name, from, to, on_update, on_delete, seq
                child = new Descendant(childName, modelName, [], schema);
                child.refModelName = item.tableName;
                child.updateRule = this.parseOnRemoveOrOnUpdate(item.onUpdate);
                child.deleteRule = this.parseOnRemoveOrOnUpdate(item.onDelete);
                childrenObj[childName] = child;
            }
            child.columns.push(item.colTo);//Descendant is the opposite of foreign key
            child.refColumns.push(item.colFrom);
        }

        children = Object.values(childrenObj);
        // console.log('Select Result: ',result);
        // console.log('Descendants Result: ',children);
        return children;
    }

    async sequenceNames(schema?: string | undefined): Promise<string[]> {
        let sequenceNames: string[] = [];
        let criteria: any = { 'nn:AUTO_INCREMENT': '' };
        if (schema) criteria['TABLE_SCHEMA'] = schema;
        let result = await this.resource.model('information_schema.tables', 't')
            .select('TABLE_NAME as tableName', 'TABLE_TYPE tableType', 'TABLE_SCHEMA as tableSchema', 'AUTO_INCREMENT as autoIncrement')
            .where(criteria).list();
        for (let item of result) {
            let sqName = 'SQ' + item.tableName;
            sequenceNames.push(sqName);
        }
        // console.log('Columns Result: ', result);
        // console.log('sequenceNames Result: ', sequenceNames);
        return sequenceNames;
    }

    normalizeColumnTypeName(typeName: string): string {
        typeName = (typeName || '').toLowerCase();
        let result: string = FieldTypeEnum.String;
        if (['varchar', 'char', 'clob'].includes(typeName)) {
            result = FieldTypeEnum.String;
        } else if (['int', 'tinyint'].includes(typeName)) {
            result = FieldTypeEnum.Int;
        } else if (['bigint'].includes(typeName)) {
            result = FieldTypeEnum.Long;
        } else if (['float'].includes(typeName)) {
            result = FieldTypeEnum.Float;
        } else if (['double'].includes(typeName)) {
            result = FieldTypeEnum.Double;
        } else if (['date'].includes(typeName)) {
            result = FieldTypeEnum.Date;
        } else if (['datetime','timestamp'].includes(typeName)) {
            result = FieldTypeEnum.DateTime;
        } else if (['boolean'].includes(typeName)) {
            result = FieldTypeEnum.Bool;
        } else if (['blob'].includes(typeName)) {
            result = FieldTypeEnum.Bytes;
        } else {
            console.warn('Normalize Column Type not know', typeName);
        }
        return result;
    }
}