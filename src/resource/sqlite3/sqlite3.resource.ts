import { Database, OPEN_CREATE, OPEN_READWRITE } from 'sqlite3';
import { ConfResource } from "../../conf.resource";
import { MetaModel } from '../../meta.model';
import { AbstractSqlResource } from "../abstract.sql.resource";
import { QRY_CREATE, QRY_DELETE, QRY_DROP, QRY_INSERT, QRY_SELECT, QRY_UPDATE } from '../resource.constants';
import { Sqlite3Create } from './sqlite3.create';
import { Sqlite3Delete } from './sqlite3.delete';
import { Sqlite3Drop } from './sqlite3.drop';
import { Sqlite3Insert } from "./sqlite3.insert";
import { Sqlite3Select } from "./sqlite3.select";
import { Sqlite3Update } from './sqlite3.update';

export class Sqlite3Resource extends AbstractSqlResource {
    resourceName = 'sqlite3';
    private conf?: ConfResource;
    constructor() {
        super();
        let _self = this;
        this.set(QRY_CREATE, (metaModel:MetaModel)=>new Sqlite3Create(_self, metaModel));
        this.set(QRY_SELECT, ()=>new Sqlite3Select(_self));
        this.set(QRY_INSERT, ()=>new Sqlite3Insert(_self));
        this.set(QRY_DELETE, ()=>new Sqlite3Delete(_self));
        this.set(QRY_UPDATE, ()=>new Sqlite3Update(_self));
        this.set(QRY_DROP,   (metaModel:MetaModel)=>new Sqlite3Drop(_self, metaModel));
    }
    
    public config(conf: ConfResource) {
        super.config(conf);
        this.conf = conf;
        let repo = new Database(this.conf.url, OPEN_READWRITE | OPEN_CREATE, (err) => {
            if (err) {
                console.error(err.message);
                throw err;
            } else {
                console.log(`Conectado ao banco de dados SQLite em ${this.conf?.url}`);
            }
        });
        this.set('repo', ()=>repo);
    }
    
}