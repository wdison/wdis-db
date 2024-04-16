import { Resource } from "../../resource";
import { Where } from "../where";

export class SqlWhere extends Where{
    constructor(resource: Resource) {
        super(resource);
    }

    render(): string {
        let sqlWhereQuery = '';
        let criterias:any[] = [];
        let fieldsValue = [];

        const fields =Object.keys(this._criteria);
        fields.forEach((key) => {
            let value = this._criteria[key];
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
                if(this._rootQuery?.isColumn(value)){
                    criterias[criterias.length-1] = criterias[criterias.length-1].replace('?', value);
                }else{
                    this._rootQuery?.addValueToQuery(value);
                }
            }
        });

        if(fields.length>0){
            sqlWhereQuery += 'where ' + criterias.join(' and ')
        }

        return sqlWhereQuery;
    }
}