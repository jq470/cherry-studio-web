// expo-sqlite on web, backed by sql.js (real SQLite compiled to WASM) on the main thread.
//
// Why not the official web build: expo-sqlite/web runs wa-sqlite inside a Worker
// and blocks the main thread on SharedArrayBuffer + Atomics (`invokeWorkerSync`).
// Under a Metro static export the worker is wrapped in a `blob:` script and never
// answers, so every openDatabaseSync() throws `Sync operation timeout` and the app
// dies on StartupFailureScreen. sql.js is synchronous SQLite, supports
// `INSERT ... RETURNING` (drizzle's insertWithOrderKey needs a returned row), and
// needs no worker, no SAB, no COOP/COEP.
//
// Sync-vs-async bridge: `initSqlJs` only returns a Promise while bootstrap calls
// `openDatabaseSync`. The load starts at module-evaluation time (long before
// DbService.onInit), and `waitForReadySync()` pumps a nested event loop with a
// same-origin synchronous XHR until wasm instantiation + IndexedDB preload finish.
//
// Persistence: after writes the database bytes are exported and stored in
// IndexedDB (`cherry-studio-sqlite` / `databases`), keyed by database name, and
// restored before the next open. `pagehide` / hidden visibility flushes.
'use strict';

const SQLJS_VERSION = '1.13.0';
const IDB_NAME = 'cherry-studio-sqlite';
const IDB_STORE = 'databases';

let runtime = null; // sql.js module, exposes Database
let readyState = 0; // 0 loading, 1 ready, 2 failed
let readyError = null;
let preloadDone = false;

const restored = new Map(); // db name -> Uint8Array from IndexedDB
const databases = new Map(); // db name -> SQLiteDatabase
const pendingWrites = new Map(); // db name -> Uint8Array
const fsSizes = new Map(); // file uri -> byte length, for expo-file-system size stats

if (typeof globalThis !== 'undefined') {
  globalThis.__CHERRY_DB_FILES__ = fsSizes;
}

function originRoot() {
  try {
    return new URL('/', location.href).href;
  } catch {
    return '/';
  }
}

function markReady(mod) {
  runtime = mod;
  readyState = 1;
  globalThis.__CHERRY_SQLITE__ = 'ready';
}

function markFailed(err) {
  readyError = err instanceof Error ? err : new Error(String(err));
  readyState = 2;
  globalThis.__CHERRY_SQLITE__ = `failed:${readyError.message}`;
}

async function fetchText(url) {
  const response = await fetch(url, { credentials: 'same-origin' });
  if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
  return response.text();
}

async function boot() {
  const local = `${originRoot()}sqljs/`;
  const cdn = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;
  let base = local;
  let code;
  try {
    code = await fetchText(`${local}sql-wasm.js`);
  } catch {
    base = cdn;
    code = await fetchText(`${cdn}sql-wasm.js`);
  }
  // sql-wasm.js declares `var initSqlJs`; evaluate it as a function body and hand
  // the symbol back (a <script> tag would be blocked by COEP cross-origin).
  const init = new Function(`${code}\n;return typeof initSqlJs !== 'undefined' ? initSqlJs : undefined;`)();
  if (typeof init !== 'function') throw new Error('sql.js did not expose initSqlJs');
  const mod = await init({ locateFile: (file) => base + file });
  markReady(mod);
}

// ---------------------------------------------------------------------------
// IndexedDB persistence
// ---------------------------------------------------------------------------

function openIdb() {
  return new Promise((resolve) => {
    if (typeof indexedDB === 'undefined') {
      resolve(null);
      return;
    }
    const request = indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) db.createObjectStore(IDB_STORE);
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(null);
  });
}

async function preload() {
  try {
    const idb = await openIdb();
    if (!idb) return;
    await new Promise((resolve) => {
      const store = idb.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE);
      const keys = store.getAllKeys();
      keys.onsuccess = () => {
        const list = keys.result || [];
        if (!list.length) {
          resolve();
          return;
        }
        let left = list.length;
        for (const key of list) {
          const get = store.get(key);
          get.onsuccess = () => {
            const value = get.result;
            if (value instanceof Uint8Array) restored.set(String(key), value);
            else if (value instanceof ArrayBuffer) restored.set(String(key), new Uint8Array(value));
            if (--left === 0) resolve();
          };
          get.onerror = () => {
            if (--left === 0) resolve();
          };
        }
      };
      keys.onerror = () => resolve();
    });
    idb.close();
  } catch {
    /* persistence is best effort */
  } finally {
    preloadDone = true;
  }
}

let flushTimer = null;

function schedulePersist() {
  if (flushTimer) return;
  flushTimer = setTimeout(flushPersist, 150);
}

function flushPersist() {
  flushTimer = null;
  for (const db of databases.values()) {
    if (!db._dirty || db._closed) continue;
    db._dirty = false;
    try {
      const bytes = db._handle.export();
      pendingWrites.set(db._name, bytes);
      // Two key forms: the registry keeps `file://` URIs, the filesystem shim
      // works on plain absolute paths.
      fsSizes.set(db._uri, bytes.length);
      fsSizes.set(db._uri.replace(/^file:\/\//, ''), bytes.length);
    } catch {
      /* ignore */
    }
  }
  if (!pendingWrites.size) return;
  const entries = [...pendingWrites.entries()];
  pendingWrites.clear();
  openIdb().then((idb) => {
    if (!idb) return;
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    for (const [name, bytes] of entries) store.put(bytes, name);
    tx.oncomplete = () => idb.close();
    tx.onerror = () => idb.close();
  });
}

if (typeof addEventListener === 'function') {
  addEventListener('pagehide', flushPersist);
  addEventListener('visibilitychange', () => {
    if (typeof document !== 'undefined' && document.visibilityState === 'hidden') flushPersist();
  });
}

// ---------------------------------------------------------------------------
// synchronous readiness gate
// ---------------------------------------------------------------------------

function pumpOnce() {
  try {
    const xhr = new XMLHttpRequest();
    // Same-origin sync XHR is only a pump; any existing static file works.
    xhr.open('GET', `${originRoot()}metadata.json?t=${Date.now()}`, false);
    xhr.send();
    return true;
  } catch {
    return false;
  }
}

function waitForReadySync() {
  if (readyState === 1 && preloadDone) return runtime;
  const deadline = Date.now() + 20000;
  while (readyState !== 1 || !preloadDone) {
    if (readyState === 2) throw readyError;
    if (Date.now() > deadline) throw new Error('sql.js did not initialize within 20s (web sqlite shim)');
    if (!pumpOnce()) {
      const until = Date.now() + 25;
      while (Date.now() < until) {
        /* sync XHR unavailable: brief blocking spin, only as a fallback */
      }
    }
  }
  return runtime;
}

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

const WRITE_SQL = /^\s*(insert|update|delete|replace|create|drop|alter|vacuum|attach|detach)\b/i;
const TOLERANT_PRAGMA =
  /^\s*pragma\s+(journal_mode|wal_checkpoint|synchronous|busy_timeout|foreign_keys|auto_vacuum|mmap_size|locking_mode|temp_store)/i;

const isWrite = (sql) => typeof sql === 'string' && WRITE_SQL.test(sql);
const tolerant = (sql) => typeof sql === 'string' && TOLERANT_PRAGMA.test(sql);

function normalizeValue(value) {
  if (value === undefined) return null;
  if (typeof value === 'boolean') return value ? 1 : 0;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  return value;
}

function normalizeParams(params) {
  if (params === undefined || params === null) return undefined;
  if (Array.isArray(params)) return params.map(normalizeValue);
  if (params instanceof ArrayBuffer) return [new Uint8Array(params)];
  if (typeof params === 'object') {
    const out = {};
    for (const [key, value] of Object.entries(params)) out[key] = normalizeValue(value);
    return out;
  }
  return [normalizeValue(params)];
}

function resolveUri(name, directory) {
  const dir = typeof directory === 'string' && directory ? directory : 'file:///web/document/';
  return dir.endsWith('/') ? `${dir}${name}` : `${dir}/${name}`;
}

// ---------------------------------------------------------------------------

class SQLiteStatement {
  constructor(database, sql) {
    this.database = database;
    this.sql = sql;
    this._stmt = null;
    this._raw = false;
    this._positioned = false;
    this.changes = 0;
    this.lastInsertRowId = 0;
  }

  _prepare() {
    if (!this._stmt) this._stmt = this.database._handle.prepare(this.sql);
    return this._stmt;
  }

  _run(params, raw) {
    const stmt = this._prepare();
    this._raw = raw;
    try {
      stmt.reset();
      const bound = normalizeParams(params);
      if (bound !== undefined) stmt.bind(bound);
      this._positioned = stmt.step();
      this.changes = this.database._rowsModified();
      this.lastInsertRowId = this.database._lastInsertRowId();
      this.database._afterWrite(this.changes, this.sql);
    } catch (error) {
      if (!tolerant(this.sql)) throw error;
      this._positioned = false;
      this.changes = 0;
    }
    return this;
  }

  executeSync(params) {
    return this._run(params, false);
  }

  executeForRawResultSync(params) {
    return this._run(params, true);
  }

  bindSync(params) {
    const bound = normalizeParams(params);
    if (bound !== undefined) this._prepare().bind(bound);
    return this;
  }

  resetSync() {
    try {
      this._prepare().reset();
    } catch {
      /* ignore */
    }
    this._positioned = false;
    return this;
  }

  getAllSync() {
    const rows = [];
    if (!this._stmt) return rows;
    let hasRow = this._positioned;
    while (hasRow) {
      rows.push(this._raw ? Array.from(this._stmt.get()) : this._stmt.getAsObject());
      hasRow = this._stmt.step();
    }
    this._positioned = false;
    return rows;
  }

  getFirstSync() {
    if (!this._stmt || !this._positioned) return undefined;
    const row = this._raw ? Array.from(this._stmt.get()) : this._stmt.getAsObject();
    this._positioned = false;
    return row;
  }

  finalizeSync() {
    if (this._stmt) {
      try {
        this._stmt.free();
      } catch {
        /* ignore */
      }
      this._stmt = null;
    }
    this._positioned = false;
  }

  async executeAsync(params) {
    return this.executeSync(params);
  }

  async executeForRawResultAsync(params) {
    return this.executeForRawResultSync(params);
  }

  async getAllAsync() {
    return this.getAllSync();
  }

  async getFirstAsync() {
    const row = this.getFirstSync();
    return row === undefined ? null : row;
  }

  async finalizeAsync() {
    this.finalizeSync();
  }
}

class SQLiteDatabase {
  constructor(name, options, directory) {
    this._name = name || 'default';
    this._options = options;
    this._uri = resolveUri(this._name, directory);
    this._closed = false;
    this._dirty = false;
    waitForReadySync();
    const bytes = restored.get(this._name);
    this._handle = bytes ? new runtime.Database(bytes) : new runtime.Database();
    this._rowId = this._handle.prepare('SELECT last_insert_rowid()');
    databases.set(this._name, this);
  }

  get name() {
    return this._name;
  }

  _assertOpen() {
    if (this._closed) throw new Error('database is closed');
  }

  _rowsModified() {
    try {
      return this._handle.getRowsModified();
    } catch {
      return 0;
    }
  }

  _lastInsertRowId() {
    try {
      this._rowId.reset();
      return this._rowId.step() ? Number(this._rowId.get()[0] || 0) : 0;
    } catch {
      return 0;
    }
  }

  _afterWrite(changes, sql) {
    if (!changes || (sql && !isWrite(sql))) return;
    this._dirty = true;
    schedulePersist();
  }

  execSync(sql) {
    this._assertOpen();
    try {
      this._handle.exec(sql);
    } catch (error) {
      if (!tolerant(sql)) throw error;
    }
    if (isWrite(sql)) {
      this._dirty = true;
      schedulePersist();
    }
  }

  prepareSync(sql) {
    this._assertOpen();
    return new SQLiteStatement(this, sql);
  }

  getAllSync(sql, params) {
    const stmt = this.prepareSync(sql);
    try {
      stmt.executeSync(params);
      return stmt.getAllSync();
    } finally {
      stmt.finalizeSync();
    }
  }

  getFirstSync(sql, params) {
    const stmt = this.prepareSync(sql);
    try {
      return stmt.executeSync(params).getFirstSync();
    } finally {
      stmt.finalizeSync();
    }
  }

  runSync(sql, params) {
    const stmt = this.prepareSync(sql);
    try {
      stmt.executeSync(params);
      return { changes: stmt.changes, lastInsertRowId: stmt.lastInsertRowId };
    } finally {
      stmt.finalizeSync();
    }
  }

  closeSync() {
    if (this._closed) return;
    flushPersist();
    try {
      this._rowId.free();
    } catch {
      /* ignore */
    }
    try {
      this._handle.close();
    } catch {
      /* ignore */
    }
    this._closed = true;
    databases.delete(this._name);
  }

  async execAsync(sql) {
    return this.execSync(sql);
  }

  async prepareAsync(sql) {
    return this.prepareSync(sql);
  }

  async getAllAsync(sql, params) {
    return this.getAllSync(sql, params);
  }

  async getFirstAsync(sql, params) {
    const row = this.getFirstSync(sql, params);
    return row === undefined ? null : row;
  }

  async runAsync(sql, params) {
    return this.runSync(sql, params);
  }

  async withTransactionAsync(fn) {
    this.execSync('BEGIN');
    try {
      const result = await fn();
      this.execSync('COMMIT');
      return result;
    } catch (error) {
      try {
        this.execSync('ROLLBACK');
      } catch {
        /* ignore */
      }
      throw error;
    }
  }

  transactionAsync(fn) {
    return this.withTransactionAsync(fn);
  }

  async serialize() {
    return this._handle.export();
  }

  serializeSync() {
    return this._handle.export();
  }

  async closeAsync() {
    this.closeSync();
  }
}

// ---------------------------------------------------------------------------
// module API
// ---------------------------------------------------------------------------

function openDatabaseSync(name, options, directory) {
  return new SQLiteDatabase(name, options, directory);
}

async function openDatabaseAsync(name, options, directory) {
  return new SQLiteDatabase(name, options, directory);
}

async function backupDatabaseAsync(options = {}) {
  const source = options.sourceDatabase;
  const target = options.destDatabase;
  if (source && target && source._handle && target._handle) {
    const bytes = source._handle.export();
    try {
      target._handle.close();
    } catch {
      /* ignore */
    }
    target._handle = new runtime.Database(bytes);
    target._dirty = true;
    flushPersist();
    return;
  }
  const from = options.sourceDatabaseName || 'default';
  const to = options.destDatabaseName || from;
  const bytes = restored.get(from);
  if (bytes) restored.set(to, bytes);
}

async function deleteDatabaseAsync(name) {
  restored.delete(name);
  const db = databases.get(name);
  if (db) db.closeSync();
  databases.delete(name);
  const idb = await openIdb();
  if (!idb) return;
  const tx = idb.transaction(IDB_STORE, 'readwrite');
  tx.objectStore(IDB_STORE).delete(name);
  tx.oncomplete = () => idb.close();
  tx.onerror = () => idb.close();
}

async function getDatabasesAsync() {
  const idb = await openIdb();
  if (!idb) return [];
  return new Promise((resolve) => {
    const request = idb.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE).getAllKeys();
    request.onsuccess = () => {
      resolve((request.result || []).map((name) => ({ name, fileSize: 0 })));
      idb.close();
    };
    request.onerror = () => {
      resolve([]);
      idb.close();
    };
  });
}

function configureWeb() {
  // Assets always come from dist-web/sqljs (or the CDN fallback); a custom
  // wasmURL from the app is ignored.
}

const SQLite = {
  openDatabaseSync,
  openDatabaseAsync,
  backupDatabaseAsync,
  deleteDatabaseAsync,
  getDatabasesAsync,
  configureWeb,
  SQLiteDatabase,
  SQLiteStatement,
};

boot().catch(markFailed);
preload();

module.exports = SQLite;
module.exports.default = SQLite;
module.exports.openDatabaseSync = openDatabaseSync;
module.exports.openDatabaseAsync = openDatabaseAsync;
module.exports.backupDatabaseAsync = backupDatabaseAsync;
module.exports.deleteDatabaseAsync = deleteDatabaseAsync;
module.exports.getDatabasesAsync = getDatabasesAsync;
module.exports.configureWeb = configureWeb;
module.exports.SQLiteDatabase = SQLiteDatabase;
module.exports.SQLiteStatement = SQLiteStatement;
