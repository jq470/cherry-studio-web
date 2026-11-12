// expo-sqlite on web, backed by the official SQLite WASM build
// (@sqlite.org/sqlite-wasm 3.54.x, FTS5 + RTREE + JSON1 enabled) on the main thread.
//
// Why not the official web build: expo-sqlite/web runs wa-sqlite inside a Worker
// and blocks the main thread on SharedArrayBuffer + Atomics (`invokeWorkerSync`).
// Under a Metro static export the worker is wrapped in a `blob:` script and never
// answers, so every openDatabaseSync() throws `Sync operation timeout` and the app
// dies on StartupFailureScreen.
//
// Why not sql.js: its stock build ships without FTS5 and RTREE ("no such module:
// fts5"), and DbService.runCustomMigrations() unconditionally executes FTS5 DDL on
// the startup critical path - the app cannot boot. The official build has both.
//
// Sync-vs-async bridge: SQLite WASM can only be initialised asynchronously, while
// bootstrap calls `openDatabaseSync`. Waiting inside a synchronous call is
// impossible (a sync-XHR pump does not drain the microtask queue - measured in
// headless Chromium: 20s pumping, zero progress). So the wait lives in the page:
// index.html's boot gate (scripts/patch-index-html.js) initialises the runtime and
// preloads IndexedDB, then injects the app bundle. This module just adopts that
// done state on evaluation, which keeps the API genuinely synchronous.
//
// Persistence: after writes the database is exported and stored in IndexedDB
// (`cherry-studio-sqlite` / `databases`), keyed by database name, and restored
// before the next open. `pagehide` / hidden visibility flushes.
'use strict';

const IDB_NAME = 'cherry-studio-sqlite';
const IDB_STORE = 'databases';

let runtime = null; // sqlite3 module (oo1 + capi + wasm)
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

// The runtime is injected by the page boot gate; a bundled `import()` would be
// rewritten by Metro, and no other load path is needed for the static build.
async function boot() {
  throw new Error(
    'sqlite runtime is provided by the index.html boot gate (scripts/patch-index-html.js)',
  );
}

function toBytes(value) {
  if (value instanceof Uint8Array) return value;
  if (value instanceof ArrayBuffer) return new Uint8Array(value);
  if (value && value.buffer instanceof ArrayBuffer) {
    return new Uint8Array(value.buffer, value.byteOffset || 0, value.byteLength);
  }
  return null;
}

// The index.html boot gate initialises SQLite WASM and preloads IndexedDB
// *before* the app bundle runs. That is the only way to have a synchronous
// SQLite API on the main thread: waiting for a Promise inside a synchronous
// call cannot work (a sync-XHR pump does not drain the microtask queue - proven
// in headless Chromium: 20s of pumping, zero progress).
function adoptPreload() {
  const pre = globalThis.__CHERRY_PRELOAD__;
  if (globalThis.__SQLITE3__) markReady(globalThis.__SQLITE3__);
  if (pre && pre.sqlite && typeof pre.sqlite.forEach === 'function') {
    pre.sqlite.forEach((value, key) => {
      const bytes = toBytes(value);
      if (bytes) restored.set(String(key), bytes);
    });
    preloadDone = true;
  }
  return readyState === 1;
}

// ---------------------------------------------------------------------------
// engine helpers (OO1 API)
// ---------------------------------------------------------------------------

function createHandle(bytes) {
  const db = new runtime.oo1.DB(':memory:', 'c');
  if (bytes && bytes.length) {
    const ptr = runtime.wasm.allocFromTypedArray(bytes);
    const flags =
      runtime.capi.SQLITE_DESERIALIZE_FREEONCLOSE | runtime.capi.SQLITE_DESERIALIZE_RESIZEABLE;
    const rc = runtime.capi.sqlite3_deserialize(db.pointer, 'main', ptr, bytes.length, bytes.length, flags);
    if (rc !== 0) throw new Error(`sqlite3_deserialize failed with rc=${rc}`);
  }
  return db;
}

function exportHandle(handle) {
  return runtime.capi.sqlite3_js_db_export(handle);
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
      const bytes = exportHandle(db._handle);
      pendingWrites.set(db._name, bytes);
      // Two key forms: the shim registry keeps `file://` URIs, the filesystem
      // shim works on plain absolute paths.
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
// readiness gate
// ---------------------------------------------------------------------------

function waitForReadySync() {
  if (readyState === 1 && preloadDone) return runtime;
  if (readyState === 2) throw readyError;
  if (readyState === 0 && globalThis.__SQLITE3__) {
    markReady(globalThis.__SQLITE3__);
    if (readyState === 1 && preloadDone) return runtime;
  }
  throw new Error(
    'sqlite runtime is not ready: the static index.html boot gate did not run. ' +
      'Patch index.html after `expo export` (scripts/patch-index-html.js).',
  );
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

// OO1 throws "This statement has no bindable parameters" for bind([]) on SQL
// without placeholders, which is the common case for DDL and plain SELECTs.
function shouldBind(bound) {
  if (bound === undefined || bound === null) return false;
  if (Array.isArray(bound)) return bound.length > 0;
  if (typeof bound === 'object') return Object.keys(bound).length > 0;
  return true;
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
  let dir = 'file:///web/document/';
  if (typeof directory === 'string' && directory) dir = directory;
  else if (directory && typeof directory === 'object' && typeof directory.uri === 'string') {
    dir = directory.uri;
  }
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
      if (shouldBind(bound)) stmt.bind(bound);
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
    if (shouldBind(bound)) this._prepare().bind(bound);
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
      rows.push(this._raw ? this._stmt.get([]) : this._stmt.get({}));
      hasRow = this._stmt.step();
    }
    this._positioned = false;
    return rows;
  }

  getFirstSync() {
    if (!this._stmt || !this._positioned) return undefined;
    const row = this._raw ? this._stmt.get([]) : this._stmt.get({});
    this._positioned = false;
    return row;
  }

  finalizeSync() {
    if (this._stmt) {
      try {
        this._stmt.finalize();
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
    this._handle = createHandle(bytes);
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
      return this._handle.changes();
    } catch {
      return 0;
    }
  }

  _lastInsertRowId() {
    try {
      this._rowId.reset();
      if (!this._rowId.step()) return 0;
      const row = this._rowId.get([]);
      return Number(row[0] || 0);
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
      this._handle.exec({ sql, multi: true });
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
      this._rowId.finalize();
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
    return exportHandle(this._handle);
  }

  serializeSync() {
    return exportHandle(this._handle);
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
    const bytes = exportHandle(source._handle);
    try {
      target._handle.close();
    } catch {
      /* ignore */
    }
    target._handle = createHandle(bytes);
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
  // Assets always come from dist-web/sqlite3; a custom wasmURL is ignored.
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

// Boot gate first; without it the synchronous API cannot be served (dev server).
if (!adoptPreload()) {
  boot().catch(markFailed);
  preload();
}

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
