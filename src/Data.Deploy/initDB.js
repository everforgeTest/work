const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();
const settings = require('../settings.json').settings;

function run(db, q, p = []) {
  return new Promise((resolve, reject) => {
    db.run(q, p, function (err) {
      if (err) return reject(err);
      resolve({ lastId: this.lastID, changes: this.changes });
    });
  });
}

async function init() {
  const dbFile = settings.dbPath;
  const dir = path.dirname(dbFile);
  if (dir && dir !== '.' && !fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const db = new sqlite3.Database(dbFile);
  try {
    await run(db, 'PRAGMA foreign_keys = ON');

    await run(db, `CREATE TABLE IF NOT EXISTS Users (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      PubKey TEXT NOT NULL UNIQUE,
      Name TEXT,
      Email TEXT,
      IsActive INTEGER DEFAULT 1,
      CreatedOn TEXT,
      UpdatedOn TEXT
    )`);

    await run(db, `CREATE TABLE IF NOT EXISTS ActivityLog (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      ActivityType TEXT,
      Message TEXT,
      CreatedOn TEXT
    )`);

    await run(db, `CREATE TABLE IF NOT EXISTS ContractVersion (
      Id INTEGER PRIMARY KEY AUTOINCREMENT,
      Version REAL NOT NULL,
      Description TEXT,
      CreatedOn INTEGER,
      LastUpdatedOn INTEGER
    )`);
  } finally {
    db.close();
  }
}

module.exports = { DBInitializer: { init } };
