const sqlite3 = require('sqlite3').verbose();

class SqliteDatabase {
  constructor(dbFile) {
    this.dbFile = dbFile;
    this.db = null;
    this.openConnections = 0;
  }

  open() {
    if (this.openConnections <= 0) {
      this.db = new sqlite3.Database(this.dbFile);
      this.openConnections = 1;
    } else this.openConnections++;
  }

  close() {
    if (this.openConnections <= 1) {
      if (this.db) this.db.close();
      this.db = null;
      this.openConnections = 0;
    } else this.openConnections--;
  }

  runQuery(query, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(query, params, function (err) {
        if (err) return reject(err);
        resolve({ lastId: this.lastID, changes: this.changes });
      });
    });
  }

  getValues(tableName, filter = null, op = '=') {
    let values = [];
    let filterStr = '1';
    if (filter && Object.keys(filter).length > 0) {
      filterStr += ' AND ';
      if (op === 'IN') {
        for (const k of Object.keys(filter)) {
          const arr = filter[k] || [];
          if (arr.length) {
            filterStr += `${k} IN (${arr.map(() => '?').join(', ')}) AND `;
            values.push(...arr);
          }
        }
        filterStr = filterStr.endsWith(' AND ') ? filterStr.slice(0, -5) : filterStr;
      } else {
        for (const k of Object.keys(filter)) {
          filterStr += `${k} ${op} ? AND `;
          values.push(filter[k]);
        }
        filterStr = filterStr.slice(0, -5);
      }
    }
    const query = `SELECT * FROM ${tableName} WHERE ${filterStr};`;
    return new Promise((resolve, reject) => {
      const rows = [];
      this.db.each(query, values, (err, row) => {
        if (err) return reject(err);
        rows.push(row);
      }, (err) => {
        if (err) return reject(err);
        resolve(rows);
      });
    });
  }

  findById(table, id) {
    const q = `SELECT * FROM ${table} WHERE Id = ?`;
    return new Promise((resolve, reject) => {
      this.db.get(q, [id], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }

  insertValue(table, obj) {
    const cols = Object.keys(obj);
    const vals = Object.values(obj);
    const placeholders = cols.map(() => '?').join(',');
    const q = `INSERT INTO ${table}(${cols.join(',')}) VALUES (${placeholders})`;
    return this.runQuery(q, vals);
  }

  updateValue(table, obj, filter) {
    const setCols = Object.keys(obj).map(k => `${k} = ?`).join(',');
    const setVals = Object.values(obj);
    const where = Object.keys(filter).map(k => `${k} = ?`).join(' AND ');
    const whereVals = Object.values(filter);
    const q = `UPDATE ${table} SET ${setCols} WHERE ${where}`;
    return this.runQuery(q, [...setVals, ...whereVals]);
  }

  deleteValues(table, filter) {
    const where = Object.keys(filter).map(k => `${k} = ?`).join(' AND ');
    const vals = Object.values(filter);
    const q = `DELETE FROM ${table} WHERE ${where}`;
    return this.runQuery(q, vals);
  }

  getLastRecord(table) {
    const q = `SELECT * FROM ${table} ORDER BY rowid DESC LIMIT 1`;
    return new Promise((resolve, reject) => {
      this.db.get(q, [], (err, row) => {
        if (err) return reject(err);
        resolve(row);
      });
    });
  }
}

module.exports = { SqliteDatabase };
