import { Database } from 'sqlite3';
import { ConfResource, FieldModel, MetaModelManager, WdisDb } from '../../src';
const confResource: ConfResource = {
  resource: 'sqlite3',
  url: 'C:\\ambiente\\tmp\\wdis\\db\\sqlite3.db'
};
const wdisDb = new WdisDb(
  confResource
);
const model = {
  name: 'João',
  id: 1,
  id2: 1.3,
  email: 'jhon@email.com',
  create: new Date()
}

const metaModel = wdisDb.meta().metaModel('teste', model);
console.log(JSON.stringify(metaModel));
const metaModelManager = (wdisDb.resource.get('metaModelManager')()) as MetaModelManager;
console.log(metaModelManager.modelLikePrisma('teste'));
metaModel.fields.push(new FieldModel('id', 'int', false, ['@id', '@default(increment())']));
metaModelManager.setMetaModel('teste', metaModel);
console.log(metaModelManager.modelLikePrisma('teste'));

let sqliteDb = (wdisDb.resource.get('repo')()) as Database;
let sql = `
          CREATE TABLE IF NOT EXISTS tableName_1 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            col_a TEXT NOT NULL,
            col_b REAL NOT NULL,
            col_c TEXT
          )
        `;
sqliteDb.run(sql);


let renderedSql = wdisDb
  .model('tableName_1')
  .select('col_a', 'col_b', 'col_c')
  .where({ 'nn:col_a': '' })
  .render();
console.log(renderedSql);




sql = `
          CREATE TABLE IF NOT EXISTS tableName_2 (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            col_a TEXT NOT NULL,
            col_b REAL NOT NULL,
            col_c TEXT
          )
        `;
sqliteDb.run(sql, (res: any, err: any) => {
  if (err) {
    console.log(err);
  }
  if (res) {
    console.log(res);
  }

  let sqlScript = `INSERT INTO tableName_1 (col_a, col_b, col_c) VALUES ('teste_a', 11, 'teste_c')`;
  sqliteDb.run(sqlScript, (err: any) => {
    if (err) console.log(err);

    let query = wdisDb
      .model('tableName_2', 't2')
      .select()
      .where('ne:t2.col_a', 't2.col_b', 't2.col_b', '11')
      .offset(2)
      .limit(3)
    renderedSql = query.render();
    console.log(renderedSql);
    query.list().then((list: any[]) => {
      console.log(JSON.stringify(list));
    });
    query.count().then((qtd: number) => {
      console.log('QTD: ' + JSON.stringify(qtd));
    })

    let query2 = wdisDb
      .model('tableName_1', 't1')
      .select('t2.col_a', 't2.col_b as col_b2', 't1.col_b as col_b1')
      .join('tableName_2', 't2').on('t1.col_b', 't2.col_b').backSelect()
      .where('ne:t1.col_a', 't1.col_b', 't1.col_b', '11')
      .offset(2)
      .limit(30)
    let renderJoin = query2.render();
    console.log(renderJoin);
    query2.list().then((list: any[]) => {
      console.log(JSON.stringify(list));
    });
  });

});



// const userResult = wdisDb.insert('user', model);
// console.log(JSON.stringify(userResult));
