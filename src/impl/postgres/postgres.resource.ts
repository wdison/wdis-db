// var mariadb = require('mariadb');
var postgres = require("pg");

let Client = postgres.Client;

import { ConfResource } from "../../conf.resource";
import { AbstractSqlResource } from '../../resource/abstract.sql.resource';
import { QRY_SELECT, QRY_WHERE, REPO } from '../../resource/resource.constants';
import { PostgresSelect } from "./postgres.select";
import { PostgresWhere } from "./postgres.where";

export class PostgresResource extends AbstractSqlResource {
    resourceName = 'postgres';
    private conf?: ConfResource;
    constructor() {
        super();
        let _self = this;
        this.set(QRY_WHERE,  () => new PostgresWhere(_self));
        this.set(QRY_SELECT, () => new PostgresSelect(_self));
        // this.set(QRY_INSERT, () => new MySqlInsert(_self));
        // this.set(QRY_DELETE, () => new MySqlDelete(_self));
        // this.set(QRY_UPDATE, () => new MySqlUpdate(_self));
        // this.set(QRY_DROP,          (metaModel:MetaModel)   => new MySqlDrop            (_self, metaModel));
        // this.set(QRY_CREATE,        (metaModel:MetaModel)   => new MySqlCreate          (_self, metaModel));
        // this.set(QRY_NATIVE,        (nativeQry:string   )   => new MySqlNative          (_self, nativeQry));
        // this.set(META_MODEL_REPO,   (                   )   => new MySqlMetaModelRepo   (_self           ));
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

                repo = new Client({
                    host: host,
                    port: port ? parseInt(port as string) : undefined,
                    user: conf.options?.user,
                    password: conf.options?.password,
                    database: conf.options?.database
                })
                    
                // repo.connect();
                repo.connect((err: any, res:any) => {
                    if (err) {
                        console.error('error connecting: ' + err.stack);
                        return;
                    }
                    console.log('connected as id ' + res.processID);
                });
                this.set(REPO, () => repo);
            }

        } catch (err) {
            console.error('Erro na conexão', err);
        }
    }

}