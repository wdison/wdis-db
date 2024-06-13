import { Check, Descendant, FKey, FieldModel, FieldTypeEnum, Index, MetaModel, ModelTypeEnum, PKey } from "../../meta.model";
import { MetaModelRepo } from "../../resource/meta/meta.model.repo";
import { Resource } from "../../resource/resource";

export class PostgresMetaModelRepo extends MetaModelRepo {
    constructor(resource: Resource) {
        super(resource);
    }

    async schemaNames(): Promise<string[]> {
        const selectQry = this.resource.native('SELECT schema_name FROM information_schema.schemata');
        let result = await selectQry.run();
        let schemaNames = result.map((row: any) => row.schema_name);
        return schemaNames;
    }

    async schemaName(): Promise<string> {
        const selectQry = this.resource.native('SELECT current_schema() as schemaName');
        let result = await selectQry.run();
        let schemaName = result && result.length ? result[0].schemaname : '';
        return schemaName;
    }

    async modelSchema(modelName: string): Promise<string> {
        let criteria: any = { 'upper(table_name)': modelName.toUpperCase() };
        let result = await this.resource.model('information_schema.tables', 't')
            .select('table_schema')
            .where(criteria)
            .unique();
        return result.table_schema;
    }

    async tableNames(schema?: string | undefined): Promise<string[]> {
        return await this.tableOrViewNames('BASE TABLE', schema);
    }
    
    async viewNames(schema?: string | undefined): Promise<string[]> {
        return await this.tableOrViewNames('VIEW', schema);
    }

    private async tableOrViewNames(type: 'BASE TABLE' | 'VIEW', schema?: string | undefined) {
        let tableNames: string[] = [];
        let criteria: any = { 'table_type': type };
        if (schema) criteria['table_schema'] = schema;

        let result = await this.resource.model('information_schema.tables', 't')
            .select('table_name')
            .where(criteria)
            .list();
        for (let item of result) {
            tableNames.push(item.table_name);
        }
        return tableNames;
    }

    async table(modelName: string, schema?: string): Promise<MetaModel> {
        let metaModel = await super.table(modelName, schema);
        if(metaModel.pk){
            let pk = metaModel.pk;
            for(let field of metaModel.fields){
                if(pk.columns.includes(field.name)){
                    field.nullable = false;
                    field.pk = true;
                    field.interfaces.push('@id')
                }
            }
        }
        return metaModel;
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
        let criteria: any = { 'upper(table_name)': modelName.toUpperCase() };
        if (schema) criteria['upper(table_schema)'] = schema.toUpperCase();

        let result = await this.resource.model('information_schema.columns', 'c')
            .select(
                'column_name as name', 
                'data_type as type', 
                'is_nullable as isnull', 
                'column_default as dflt_value', 
                'character_maximum_length as clength', 
                'numeric_precision as nprecision', 
                'numeric_scale as scale',
            )
            .where(criteria)
            .order('ordinal_position')
            .list();

        for (let item of result) {
            item.isnull = item.isnull==true||item.isnull == 'YES';
            let fieldModel = new FieldModel(item.name, this.normalizeColumnTypeName(item.type), item.isnull);
            if (item.ispk) fieldModel.pk = true; // Set the pk property if the column is a primary key
            if (fieldModel.pk) fieldModel.interfaces.push('@id');
            if (item.clength) fieldModel.interfaces.push('@length(' + item.clength + ')');
            if (item.nprecision) fieldModel.interfaces.push('@precision(' + item.nprecision + ')');
            if (item.scale) fieldModel.interfaces.push('@scale(' + item.scale + ')');
            if (item.dflt_value) {
                if (['current_date', 'current_timestamp'].includes(item.dflt_value)) {
                    fieldModel.interfaces.push('@default(now())');
                }else if (item.dflt_value.includes('nextval(')) {
                    fieldModel.interfaces.push('@default(increment())');
                } else {
                    let valueDefault = item.dflt_value as string;
                    if ((valueDefault).startsWith("'")) valueDefault = valueDefault.substring(1);
                    if ((valueDefault).endsWith("'")) valueDefault = valueDefault.substring(0, valueDefault.length - 1);
                    fieldModel.interfaces.push('@default("' + valueDefault + '")');
                }
            }
            fields.push(fieldModel);
        }
        console.log('Select Result: ',result);
        console.log('columns Result: ',fields);
        return fields;
    }

    async pK(modelName: string, schema?: string | undefined): Promise<PKey | undefined> {
        let schemaPart = schema ? ` AND upper(t.table_schema)='${schema}'` : '';

        let result = await this.resource.native(`
        SELECT k.constraint_name pkname, k.column_name as name 
        FROM information_schema.table_constraints t 
        JOIN information_schema.key_column_usage k 
        ON t.constraint_name = k.constraint_name 
        WHERE t.constraint_type='PRIMARY KEY' 
        AND upper(t.table_name)='${modelName.toUpperCase()}' 
        ${schemaPart.toUpperCase()}
        `).run();

        let columns: string[] = [];
        result.forEach((item: { name: string }) => {
            columns.push(item.name);
        });
        if (columns.length) {
            // let pkName = ('PK' + modelName).toUpperCase();
            let pkName = result[0].pkname;
            let pk = new PKey(pkName, modelName, columns, schema);
            return pk;
        }
        return undefined;
    }

    async fKs(modelName: string, schema?: string | undefined): Promise<FKey[]> {
        let fks: FKey[] = [];
        let schemaPart = schema ? `AND upper(tc.table_schema) = '${schema}'` : '';
    
        let result = await this.resource.native(`
        SELECT
            tc.constraint_name AS fkname,
            tc.table_name AS table_name,
            pkkcu.table_name AS reftable,
            kcu.column_name AS colfrom,
            pkkcu.column_name AS colto,
            rc.update_rule AS onupdate,
            rc.delete_rule AS ondelete,
            kcu.ordinal_position AS colseq
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name AND tc.constraint_schema = rc.constraint_schema
        JOIN information_schema.key_column_usage pkkcu
            ON rc.unique_constraint_name = pkkcu.constraint_name AND rc.unique_constraint_schema = pkkcu.constraint_schema AND kcu.ordinal_position = pkkcu.ordinal_position
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND upper(tc.table_name) = '${modelName.toUpperCase()}'
            ${schemaPart.toUpperCase()}
        ORDER BY tc.constraint_name, kcu.ordinal_position;
        `).run();
    
        let fksObj: { [key: string]: FKey } = {};
    
        for (let item of result) {
            let fk = fksObj[item.fkname];
            if (!fk) {
                let fkname = item.fkname;
                fk = new FKey(fkname, modelName, [], schema);
                fk.refModelName = item.reftable;
                fk.updateRule = this.parseOnRemoveOrOnUpdate(item.onupdate);
                fk.deleteRule = this.parseOnRemoveOrOnUpdate(item.ondelete);
                fksObj[fkname] = fk;
            }
            fk.columns.push(item.colfrom);
            fk.refColumns.push(item.colto);
        }
    
        fks = Object.values(fksObj);
        // console.log('Select Result: ',result);
        // console.log('fks Result: ',fks);
        return fks;
    }

    async idxs(modelName: string, schema?: string | undefined): Promise<Index[]> {
        let idxs: Index[] = [];
        let schemaPart = schema ? `AND upper(s.schemaname) = '${schema}'` : '';

        let result = await this.resource.native(`
            SELECT
                s.indexname AS idxname,
                a.attname AS colname,
                s.tablename AS tablename,
                s.schemaname AS schemaname,
                i.indisunique AS isunique
            FROM pg_indexes s
            JOIN pg_class c ON c.relname = s.indexname
            JOIN pg_index i ON c.oid = i.indexrelid
            JOIN pg_attribute a ON a.attrelid = c.oid AND a.attnum = ANY (i.indkey)
            WHERE upper(s.tablename) = '${modelName.toUpperCase()}'
            ${schemaPart.toUpperCase()}
            ;
        `).run();

        let idxsObj: { [key: string]: Index } = {};

        for (let item of result) {
            let idxName = item.idxname;
            let idx = idxsObj[idxName];
            if (!idx) {
                idx = new Index(idxName, modelName, [], schema);
                idx.unique = item.isunique;
                idxsObj[idxName] = idx;
            }
            // Fetch column names using the indkey (column positions) and pg_attribute table
            idx.columns.push(item.colname);
        }

        for (let idxName in idxsObj) {
            if (idxName.toLowerCase() == 'pk'+modelName.toLowerCase() || idxsObj[idxName].columns.includes(idxName)) {
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
        // Implement check constraints retrieval for Postgres if needed
        return checks;
    }

    async descendants(modelName: string, schema?: string | undefined): Promise<Descendant[]> {
        let children: Descendant[] = [];

        let schemaPart = schema ? `AND upper(pkkcu.table_schema) = '${schema}'` : '';
    
        let result = await this.resource.native(`
        SELECT
            tc.constraint_name AS fkname,
            tc.table_name AS tablename,
            pkkcu.table_schema AS refschema,
            pkkcu.table_name AS reftable,
            kcu.column_name AS colfrom,
            pkkcu.column_name AS colto,
            rc.update_rule AS onupdate,
            rc.delete_rule AS ondelete,
            kcu.ordinal_position AS colseq
        FROM information_schema.table_constraints tc
        JOIN information_schema.key_column_usage kcu
            ON tc.constraint_name = kcu.constraint_name AND tc.table_schema = kcu.table_schema
        JOIN information_schema.referential_constraints rc
            ON tc.constraint_name = rc.constraint_name AND tc.constraint_schema = rc.constraint_schema
        JOIN information_schema.key_column_usage pkkcu
            ON rc.unique_constraint_name = pkkcu.constraint_name AND rc.unique_constraint_schema = pkkcu.constraint_schema AND kcu.ordinal_position = pkkcu.ordinal_position
        WHERE tc.constraint_type = 'FOREIGN KEY'
            AND upper(pkkcu.table_name) = '${modelName.toUpperCase()}'
            ${schemaPart.toUpperCase()}
        ORDER BY tc.constraint_name, kcu.ordinal_position;
        `).run();

        let childrenObj: { [key: string]: Descendant } = {};

        for (let item of result) {
            let childName = item.fkname;
            let child = childrenObj[childName];
            if (!child) {
                child = new Descendant(childName, modelName, [], schema);
                child.refModelName = item.tablename;
                child.updateRule = this.parseOnRemoveOrOnUpdate(item.onupdate);
                child.deleteRule = this.parseOnRemoveOrOnUpdate(item.ondelete);
                childrenObj[childName] = child;
            }
            child.columns.push(item.colto);
            child.refColumns.push(item.colfrom);
        }

        children = Object.values(childrenObj);
        // console.log('Select Result: ',result);
        // console.log('descendants Result: ',children);
        return children;
    }

    async sequenceNames(schema?: string | undefined): Promise<string[]> {
        let sequenceNames: string[] = [];
        let schemaPart = schema ? `AND sequence_schema = '${schema}'` : '';
    
        let result = await this.resource.native(`
            SELECT sequence_name
            FROM information_schema.sequences
            WHERE sequence_schema NOT IN ('pg_catalog', 'information_schema')
            ${schemaPart};
        `).run();
    
        sequenceNames = result.map((row: any) => row.sequence_name);
        return sequenceNames;
    }

    normalizeColumnTypeName(typeName: string): string {
        typeName = (typeName || '').toLowerCase();
        let result: string = FieldTypeEnum.String;
        if (['varchar', 'char', 'text', 'character varying'].includes(typeName)) {
            result = FieldTypeEnum.String;
        } else if (['int', 'integer', 'smallint', 'bigint'].includes(typeName)) {
            result = FieldTypeEnum.Int;
        } else if (['real', 'double precision', 'numeric', 'decimal', 'float'].includes(typeName)) {
            result = FieldTypeEnum.Float;
        } else if (['timestamp', 'timestamptz'].includes(typeName)) {
            result = FieldTypeEnum.DateTime;
        } else if (['date'].includes(typeName)) {
            result = FieldTypeEnum.Date;
        } else if (['bool', 'boolean'].includes(typeName)) {
            result = FieldTypeEnum.Bool;
        } else if (['bytea'].includes(typeName)) {
            result = FieldTypeEnum.Bytes;
        } else {
            console.warn('Normalize Column Type not know', typeName);
        }
        return result;
    }
}
