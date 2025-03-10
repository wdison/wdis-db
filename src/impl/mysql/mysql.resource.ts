// import mysql from 'mysql2';
import { ConfResource } from "../../conf.resource";
import { MetaModel } from "../../meta.model";
import { AbstractSqlResource } from '../../resource/abstract.sql.resource';
import { META_MODEL_REPO, QRY_CREATE, QRY_DELETE, QRY_DROP, QRY_INSERT, QRY_NATIVE, QRY_SELECT, QRY_UPDATE, REPO } from '../../resource/resource.constants';
import { MySqlCreate } from "./mysql.create";
import { MySqlDelete } from "./mysql.delete";
import { MySqlDrop } from "./mysql.drop";
import { MySqlInsert } from "./mysql.insert";
import { MySqlMetaModelRepo } from "./mysql.meta.model.repo";
import { MySqlNative } from "./mysql.native";
import { MySqlSelect } from "./mysql.select";
import { MySqlUpdate } from "./mysql.update";

export class MySqlResource extends AbstractSqlResource {
    resourceName = 'mysql';
    private conf?: ConfResource;
    constructor() {
        super();
        let _self = this;
        this.set(QRY_SELECT, () => new MySqlSelect(_self));
        this.set(QRY_INSERT, () => new MySqlInsert(_self));
        this.set(QRY_DELETE, () => new MySqlDelete(_self));
        this.set(QRY_UPDATE, () => new MySqlUpdate(_self));
        this.set(QRY_DROP,          (metaModel:MetaModel)   => new MySqlDrop            (_self, metaModel));
        this.set(QRY_CREATE,        (metaModel:MetaModel)   => new MySqlCreate          (_self, metaModel));
        this.set(QRY_NATIVE,        (nativeQry:string   )   => new MySqlNative          (_self, nativeQry));
        this.set(META_MODEL_REPO,   (                   )   => new MySqlMetaModelRepo   (_self           ));
    }
    
    public config(conf: ConfResource) {
        var mysql = require('mysql2');
        
        super.config(conf);
        this.conf = conf;
        let repo = { query: () => { }, connect: (cb: any = undefined) => { }, threadId: undefined };
        try {
            if (conf.options?.connection) {
                repo = conf.options.connection;
            } else {
                let host = conf.options?.host || conf.url;
                let port = conf.options?.port;
                if (host == 'localhost') host = '127.0.0.1';
                repo = mysql.createConnection({
                    host: host,
                    port: port ? parseInt(port as string) : undefined,
                    user: conf.options?.user,
                    password: conf.options?.password,
                    database: conf.options?.database
                });
                repo.connect((err: any) => {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return;
                    }
                    console.log('connected as id ' + repo.threadId);
                });
            }

        } catch (err) {
            console.error('Erro na conexão', err);
        }
        this.set(REPO, () => repo);
    }

}