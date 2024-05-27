// var mariadb = require('mariadb');
var mariadb = require('mariadb/callback');

import { ConfResource } from "../../conf.resource";
import { MetaModel } from "../../meta.model";
import { AbstractSqlResource } from '../../resource/abstract.sql.resource';
import { META_MODEL_REPO, QRY_CREATE, QRY_DELETE, QRY_DROP, QRY_INSERT, QRY_NATIVE, QRY_SELECT, QRY_UPDATE, REPO } from '../../resource/resource.constants';
import { MySqlCreate } from "../mysql/mysql.create";
import { MySqlDelete } from "../mysql/mysql.delete";
import { MySqlDrop } from "../mysql/mysql.drop";
import { MySqlInsert } from "../mysql/mysql.insert";
import { MySqlMetaModelRepo } from "../mysql/mysql.meta.model.repo";
import { MySqlNative } from "../mysql/mysql.native";
import { MySqlSelect } from "../mysql/mysql.select";
import { MySqlUpdate } from "../mysql/mysql.update";

export class MariaDbResource extends AbstractSqlResource {
    resourceName = 'mariadb';
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
        let _self = this;
        super.config(conf);
        this.conf = conf;
        let repo:any;
        try {
            if (conf.options?.connection) {
                repo = conf.options.connection;
                this.set(REPO, () => repo);
            } else {
                let host = conf.options?.host || conf.url;
                let port = conf.options?.port;
                if (host == 'localhost') host = '127.0.0.1';

                // let pool = mariadb.createPool({
                //     host: host,
                //     port: port ? parseInt(port as string) : undefined,
                //     user: conf.options?.user,
                //     password: conf.options?.password,
                //     connectTimeout: conf.options?.timeout,
                //     database: conf.options?.database
                // });
                // pool.getConnection().then((conn:any)=>{
                //     console.log('Conectado com MARIADB');
                    
                //     _self.set(REPO, () => conn);
                // }).catch((err:any)=>{
                //     console.log('Erro em pool getConnection', err);
                    
                // });
                
                repo = mariadb.createConnection({
                    host: host,
                    port: port ? parseInt(port as string) : undefined,
                    user: conf.options?.user,
                    password: conf.options?.password,
                    connectTimeout: conf.options?.timeout,
                    database: conf.options?.database
                });
                repo.connect((err: any) => {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return;
                    }
                    console.log('connected as id ' + repo.threadId);
                });
                this.set(REPO, () => repo);
            }

        } catch (err) {
            console.error('Erro na conexão', err);
        }
    }

}