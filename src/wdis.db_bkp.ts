// const repoManager = require('../db/repo.manager');
import { WdisEvent } from '@wdis/event';
import { MetaModel } from './meta.model';
import { QueryModel } from './query.model';
import { ConfResource } from './conf.resource';
import { ResourceFactory } from './resource/resource.factory';
import { Resource } from './resource/resource';

let _selfWdisDbInternal:WdisDbInternal|undefined=undefined;
class WdisDbInternal extends WdisEvent {
    repoManager: any;
    constructor(repoManager:any/*Configurar uma interface amigavel para esse repo*/) {
        super();
        this.repoManager = repoManager;
    }

    metaModel(modelName:string, model:any):MetaModel {
        const fields:string[] = Object.keys(model);
        let fieldsValue:any[] = [];
        fields.forEach((key) => {
            let value = model[key];
            if (Array.isArray(value)) value = JSON.stringify(value);
            fieldsValue.push(value);
        })
        const metaModel = new MetaModel(modelName, model, fields, fieldsValue);
        return metaModel;
    }

    queryModel(modelName:string, criteriaOjb:any):QueryModel {
        let fieldsValue:any[] = [];
        let criterias:string[] = [];
        let criteriaWhere = criteriaOjb;
        let getFields = '*';
        let groupBy = '';
        if(criteriaOjb.get||criteriaOjb.where||criteriaOjb.group){
            criteriaWhere = criteriaOjb.where;
            if(criteriaOjb.get){getFields = Array.isArray(criteriaOjb.get)? criteriaOjb.get.join(',') : criteriaOjb.get;}
            if(criteriaOjb.group){groupBy = 'group by ' + (Array.isArray(criteriaOjb.group)? criteriaOjb.group.join(',') : criteriaOjb.group);}
        }
        const fields = criteriaWhere ? Object.keys(criteriaWhere) : [];
        fields.forEach((key) => {
            let value = criteriaWhere[key];
            let op;

            if (key.indexOf(':') > -1) {
                let keySplit = key.split(':');
                op = keySplit[0];
                let keyPrinc = keySplit[1];
                if (op == 'eq') {
                    criterias.push(keyPrinc + ' = ?')
                } else if (op == 'ne') {
                    criterias.push(keyPrinc + " != ?")
                } else if (op == 'n') {
                    criterias.push(keyPrinc + " is null")
                } else if (op == 'nn') {
                    criterias.push(keyPrinc + " is not null")
                } else if (op == 'in') {
                    criterias.push(keyPrinc + " in (?)")
                } else if (op == 'lk') {
                    criterias.push(keyPrinc + " like '%'||?||'%'")
                } else if (op == 'sw' || op == 'iw') {
                    criterias.push(keyPrinc + " like ?||'%'")
                } else if (op == 'ew') {
                    criterias.push(keyPrinc + " like '%'||?")
                } else if (op == 'gt') {
                    criterias.push(keyPrinc + " > ?")
                } else if (op == 'ge') {
                    criterias.push(keyPrinc + " >= ?")
                } else if (op == 'lt') {
                    criterias.push(keyPrinc + " < ?")
                } else if (op == 'le') {
                    criterias.push(keyPrinc + " <= ?")
                } else {
                    criterias.push(keyPrinc + ' = ?')
                }
            } else {
                criterias.push(key + ' = ?')
            }

            if(op!='n' && op!='nn'){
                fieldsValue.push(value);
            }
        });

        let sqlQuery = 'select '+getFields+' from ' + modelName
        if (criterias.length) {
            sqlQuery += ' where ' + criterias.join(' and ')
        }
        sqlQuery += ' ' + groupBy;

        const queryModel = new QueryModel(modelName, criteriaOjb, fields, fieldsValue, criterias, sqlQuery);
        return queryModel;
    }

    insert(modelName:string, model:any):Promise<any> {
        return new Promise(async (accept, reject) => {
            await _selfWdisDbInternal?.intercept(('wdisdb:'+modelName+':insert'), {db:_selfWdisDbInternal, model, modelName, type:'insert'});

            const metaModel = this.metaModel(modelName, model);
            // console.log(metaModel)
            let sqlScript = `INSERT INTO ${metaModel.modelName} (${metaModel.fields.join(',')}) VALUES (${''.padStart(metaModel.fields.length * 2, ',?').substring(1)})  RETURNING *`;
            // console.log('sql: '+sqlScript);
            _selfWdisDbInternal?.repoManager.db.run(sqlScript, metaModel.fieldsValue, function (err:any) {
                if (err) {
                    reject(err)
                } else {
                    // console.log(`A row has been inserted with rowid ${this.lastID}`);
                    // metaModel.model.id = this.lastID;
                    metaModel.model.id = _selfWdisDbInternal?.repoManager.db.lastID;
                    accept(metaModel.model)
                }
            });
        });
    }

    update(modelName:string, model:any, id:any):Promise<any> {
        let result = new Promise((accept, reject) => {
            _selfWdisDbInternal?.intercept(('wdisdb:'+modelName+':update'), {db:_selfWdisDbInternal, model, modelName, type:'update'});

            const metaModel = this.metaModel(modelName, model);
            // if(!id) id = metaModel.id
            if (!id) id = model.id;

            let fields = Object.assign(metaModel.fields);
            let fieldsValue = Object.assign(metaModel.fieldsValue);
            let idxId = fields.indexOf('id')
            if (idxId > -1) {
                fields.splice(idxId, 1);
                fieldsValue.splice(idxId, 1);
            }
            fieldsValue.push(id)//push id to last idx

            let sqlScript = `UPDATE ${metaModel.modelName} set ${fields.map((field:string) => ' ' + field + ' = ? ').join(',')} WHERE id = ? `;
            // console.log('sql: '+sqlScript);
            // console.log('fieldsValue: '+fieldsValue);
            _selfWdisDbInternal?.repoManager.db.run(sqlScript, fieldsValue, function (err:any) {
                if (err) {
                    reject(err)
                } else {
                    accept(metaModel.model)
                }
            });
        });
        return result;
    }

    async insertOrUpdate(modelName:string, model:any):Promise<any> {
        await _selfWdisDbInternal?.intercept(('wdisdb:'+modelName+':insertorupdate'), {db:_selfWdisDbInternal, model, modelName, type:'insertOrUpdate'});
        if (model.id) {
            return await _selfWdisDbInternal?.update(modelName, model, model.id);
        } else {
            return await _selfWdisDbInternal?.insert(modelName, model);
        }
    }

    async insertOrUpdateModels(modelName:string, models:any):Promise<any> {
        if (Array.isArray(models)) {
            let results:any[] = [];
            for (let model of models) {
                results.push(await _selfWdisDbInternal?.insertOrUpdate(modelName, model));
            }
            return results;
        } else {
            return await _selfWdisDbInternal?.insertOrUpdate(modelName, models);
        }
    }

    selectId(modelName:string, id:any, options:any={skipNoRow:false}):Promise<any> {
        let result = new Promise((accept, reject) => {
            _selfWdisDbInternal?.repoManager.db.get('SELECT * FROM ' + modelName + ' WHERE id = ?', id, (err:any, row:any) => {
                if (err) {
                    reject(`Erro ao consultar ${modelName} ${id}.` + err.message);
                } else if (!row) {
                    if(!options.skipNoRow)accept(null);
                    else reject(`Nenhum registro encontrado para ${modelName} ${id}.`);
                } else {
                    _selfWdisDbInternal?.intercept(('wdisdb:'+modelName+':selectid'), {db: _selfWdisDbInternal, model: row, modelName, type:'selectid'});
                    accept(row);
                }
            });
        })
        return result;
    }
    
    async deleteId(modelName:string, id:any):Promise<any> {
        let result = new Promise((accept, reject) => {
            _selfWdisDbInternal?.repoManager.db.run('DELETE FROM ' + modelName + ' WHERE id = ?', id, function (err:any) {
                if (err) {
                    reject(`Falha ao excluir ${modelName} ${id}. `+err.message);
                } else {
                    accept(`${modelName} ${id} excluído com sucesso.`);
                }
            });
        })
        return result;
    }

    select(modelName:string, criteriaOjb:any):Promise<any>{
        let result = new Promise((accept, reject) => {
            let queryModel:QueryModel = _selfWdisDbInternal?.queryModel(modelName, criteriaOjb) as QueryModel;
            _selfWdisDbInternal?.repoManager.db.all(queryModel.sqlQuery, queryModel.fieldsValue, (err:any, rows:any[]) => {
                if (err) {
                    reject(new Error(`Falha ao selecionar registros de ${modelName}. ` + err.message));
                } else {
                    // _selfWdisDbInternal?.intercept(('select:pos:'+modelName), {db: _selfWdisDbInternal, model: rows, modelName, type:'select'});
                    _selfWdisDbInternal?.intercept(('wdisdb:'+modelName+':pos:select'), {db: _selfWdisDbInternal, model: rows, modelName, type:'select'});
                    accept(rows);
                }
            });
        })
        return result;
    }

    // eventName:any, onEventFnc:any
    public on(keyEvent:any, callback: any){
        keyEvent = (keyEvent||'').toLowerCase();
        if(keyEvent.indexOf('wdisdb:') != 0) {throw 'Evento desconhecido '+keyEvent;}
        super.on(keyEvent, callback);
        return this;
    }

    async intercept(keyEvent:string, ...param:any){
        keyEvent = (keyEvent||'').toLowerCase();
        await super.intercept(keyEvent, ...param);
    }
}


let wdisDbInternal:WdisDbInternal|undefined;

export class WdisDb {
    
    constructor(/*Colocar configuração do Repositorio/BancoDeDados aqui */confResource: ConfResource){
        let resource:Resource = ResourceFactory.createResource(confResource);
        wdisDbInternal = _selfWdisDbInternal = new WdisDbInternal({db:resource});
    }

    public metaModel(modelName:string, model:any):MetaModel {
        return wdisDbInternal?.metaModel(modelName, model) as MetaModel;
    }
    public queryModel(modelName:string, model:any):QueryModel {
        return wdisDbInternal?.queryModel(modelName, model) as QueryModel;
    }
    public insert(modelName:string, model:any):Promise<any> {
        return wdisDbInternal?.insert(modelName, model) as Promise<any>;
    }
    public update(modelName:string, model:any, id:any):Promise<any> {
        return wdisDbInternal?.update(modelName, model, id) as Promise<any>;
    }
    public async insertOrUpdate(modelName:string, model:any):Promise<any> {
        return await wdisDbInternal?.insertOrUpdate(modelName, model) as Promise<any>;
    }
    public async insertOrUpdateModels(modelName:string, models:any):Promise<any> {
        return await wdisDbInternal?.insertOrUpdateModels(modelName, models) as Promise<any>;
    }
    public async selectId(modelName:string, id:any, options:any):Promise<any> {
        return wdisDbInternal?.selectId(modelName, id, options) as Promise<any>;
    }
    public async deleteId(modelName:string, id:any):Promise<any> {
        return wdisDbInternal?.deleteId(modelName, id) as Promise<any>;
    }
    public async select(modelName:string, criteriaOjb:any):Promise<any>{
        return wdisDbInternal?.select(modelName, criteriaOjb) as Promise<any>;
    }
    public on(keyEvent:string, callback:Function){
        wdisDbInternal?.on(keyEvent, callback);
    }
}
