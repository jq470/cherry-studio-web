// Local harness: validates overlay/src/web-shims/expo-sqlite.web.js against the
// contract drizzle-orm's expo-sqlite adapter actually calls.
//
// Mirrors the browser boot gate: sqlite3 is initialised first, then exposed on
// globalThis.__SQLITE3__ / __CHERRY_PRELOAD__, and only afterwards is the shim
// loaded - exactly the order the real page uses.
const fs = require('node:fs');
const path = require('node:path');

const WASM_DIR = process.env.SQLITE_WASM_DIR || '/tmp/probe/node_modules/@sqlite.org/sqlite-wasm/dist';

(async () => {
  globalThis.location = { href: 'http://localhost:8099/' };
  globalThis.indexedDB = undefined;

  // Official build: FTS5 + RTREE available, unlike sql.js stock.
  const { default: sqlite3InitModule } = await import(
    new URL(`file://${WASM_DIR}/node.mjs`).href
  );
  const sqlite3 = await sqlite3InitModule({ print: () => {}, printErr: () => {} });
  globalThis.__SQLITE3__ = sqlite3;
  globalThis.__CHERRY_PRELOAD__ = { sqlite: new Map(), fs: new Map() };

  const shim = require(path.resolve(__dirname, '../overlay/src/web-shims/expo-sqlite.web.js'));

  const pass = [];
  const fail = [];
  const check = (name, condition, detail) => {
    if (condition) pass.push(name);
    else fail.push(`${name} :: ${detail}`);
  };

  const db = shim.openDatabaseSync('cherry.db');
  check('openDatabaseSync', Boolean(db), 'no handle');

  db.execSync('PRAGMA foreign_keys = ON');
  // expo-sqlite's execSync() returns void; business code only relies on it not
  // throwing (sealDatabase later runs PRAGMA wal_checkpoint(TRUNCATE)).
  let pragmaError = null;
  try { db.execSync('PRAGMA journal_mode = WAL'); } catch (error) { pragmaError = error; }
  check('pragma journal_mode accepted', !pragmaError, String(pragmaError));
  let checkpoint = null;
  try { checkpoint = db.prepareSync('PRAGMA wal_checkpoint(TRUNCATE)').executeSync([]).getFirstSync(); } catch (error) { checkpoint = { error: String(error) }; }
  check('wal_checkpoint usable', checkpoint && checkpoint.busy !== undefined, JSON.stringify(checkpoint));

  db.execSync('CREATE TABLE IF NOT EXISTS users (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL)');
  const insert = db.prepareSync('INSERT INTO users(name) VALUES (?) RETURNING id, name');
  const returned = insert.executeForRawResultSync(['first']).getAllSync();
  insert.finalizeSync();
  check('INSERT RETURNING raw rows', returned.length === 1 && returned[0][1] === 'first', JSON.stringify(returned));

  const run = db.runSync('INSERT INTO users(name) VALUES (?)', 'second');
  check('runSync reports changes', run.changes === 1, JSON.stringify(run));
  check('runSync reports lastInsertRowId', run.lastInsertRowId === 2, JSON.stringify(run));

  for (const name of ['third', 'fourth', 'fifth']) db.runSync('INSERT INTO users(name) VALUES (?)', name);

  db.execSync('CREATE VIRTUAL TABLE IF NOT EXISTS users_fts USING fts5(name)');
  db.execSync("CREATE TRIGGER IF NOT EXISTS users_ai AFTER INSERT ON users BEGIN INSERT INTO users_fts(rowid, name) VALUES (new.id, new.name); END");
  db.execSync('INSERT INTO users(name) VALUES (?)');
  db.execSync("INSERT INTO users_fts(users_fts) VALUES('rebuild')");

  const fts = db.getAllSync("SELECT name FROM users_fts WHERE users_fts MATCH 'second'");
  check('fts5 works', fts.length === 1 && fts[0].name === 'second', JSON.stringify(fts));

  const first = db.getFirstSync('SELECT name, id FROM users WHERE id > 0 ORDER BY id');
  check('getFirstSync', first && first.name === 'first', JSON.stringify(first));

  const count = db.getAllSync('SELECT COUNT(*) AS n FROM users');
  check('count after loop', count[0].n === 6, JSON.stringify(count));

  // expo-sqlite also accepts variadic params; customSql.ts relies on it
  // (`getAllSync(sql, afterRowid, '*', ...)` / `runSync(sql, text, rowid)`).
  const variadicRows = db.getAllSync('SELECT id FROM users WHERE id > ? AND id < ?', 0, 3);
  check('getAllSync variadic params', variadicRows.length === 2, JSON.stringify(variadicRows));
  const variadicUpdate = db.runSync('UPDATE users SET name = ? WHERE id = ?', 'variadic', 2);
  check('runSync variadic params', variadicUpdate.changes === 1, JSON.stringify(variadicUpdate));
  const variadicRow = db.getFirstSync('SELECT name FROM users WHERE id = ?', 2);
  check('getFirstSync variadic params', variadicRow && variadicRow.name === 'variadic', JSON.stringify(variadicRow));

  // Backup plumbing used by backupDatabase.ts
  if (typeof shim.backupDatabaseAsync === 'function') {
    const dest = shim.openDatabaseSync('backup.db');
    await shim.backupDatabaseAsync({ sourceDatabase: db, destDatabase: dest });
    const backupCount = dest.prepareSync('SELECT COUNT(*) AS n FROM users').executeSync([]);
    check('backupDatabaseAsync copies rows', backupCount.getFirstSync().n === 6, 'backup empty');
    dest.closeSync();
  } else {
    fail.push('backupDatabaseAsync missing');
  }

  db.closeSync();

  console.log(pass.map((p) => `PASS ${p}`).join('\n'));
  if (fail.length) {
    console.log(fail.map((f) => `FAIL ${f}`).join('\n'));
    process.exit(1);
  }
  console.log(`\nall ${pass.length} checks passed`);
})();
