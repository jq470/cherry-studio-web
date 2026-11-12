// expo-file-system on web.
//
// The app imports the *new* class API (`Directory`, `File`, `Paths`, `FileMode`)
// from `expo-file-system` in 60+ places; the official web entry only ships a
// legacy singleton, so on web `Directory.validatePath is not a function` throws
// during startup. This shim provides a small virtual filesystem with the same
// synchronous surface, persisted to IndexedDB so imported files survive reload.
//
// Two deliberate behaviours:
//   * Constructing a Directory/File must NOT register it in the tree. The old
//     attempt did, which made `.exists` always true, so `getStorageBoot()` saw a
//     "storage-control" directory, assumed a native store was present and threw
//     `BackupError: unavailable`. Only create()/write() touch the tree.
//   * `size` for `.db` / `-wal` / `-shm` comes from the sqlite shim's registry
//     (globalThis.__CHERRY_DB_FILES__), because the database bytes never live in
//     this tree.
'use strict';

const ROOT = '/web';
const DOCUMENT = `${ROOT}/document`;
const CACHE = `${ROOT}/cache`;
const IDB_NAME = 'cherry-studio-fs';
const IDB_STORE = 'entries';

const entries = new Map(); // path -> { dir: true } | { text: string } | { bytes: Uint8Array }
const dirty = new Set();
let loaded = false;
let loading = false;
let flushTimer = null;

function originRoot() {
  try {
    return new URL('/', location.href).href;
  } catch {
    return '/';
  }
}

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

async function loadEntries() {
  loading = true;
  try {
    const idb = await openIdb();
    if (!idb) return;
    await new Promise((resolve) => {
      const store = idb.transaction(IDB_STORE, 'readonly').objectStore(IDB_STORE);
      const request = store.openCursor();
      request.onsuccess = () => {
        const cursor = request.result;
        if (!cursor) {
          resolve();
          return;
        }
        entries.set(String(cursor.key), cursor.value);
        cursor.continue();
      };
      request.onerror = () => resolve();
    });
    idb.close();
  } catch {
    /* best effort */
  } finally {
    loaded = true;
  }
}

function normalizeEntry(value) {
  if (!value || typeof value !== 'object') return { text: '' };
  if (value.dir) return { dir: true };
  if (typeof value.text === 'string') return { text: value.text };
  if (value.bytes) {
    if (value.bytes instanceof Uint8Array) return { bytes: value.bytes };
    if (value.bytes instanceof ArrayBuffer) return { bytes: new Uint8Array(value.bytes) };
    if (value.bytes.buffer instanceof ArrayBuffer) {
      return {
        bytes: new Uint8Array(value.bytes.buffer, value.bytes.byteOffset || 0, value.bytes.byteLength),
      };
    }
  }
  return { text: '' };
}

// The index.html boot gate loads this tree before the app bundle runs, so
// `.exists` is already accurate during startup (a wrong `false` here used to
// make getStorageBoot() pick the wrong branch).
function seedFromPreload() {
  const pre = globalThis.__CHERRY_PRELOAD__;
  if (!pre || !pre.fs || typeof pre.fs.forEach !== 'function') return false;
  pre.fs.forEach((value, key) => entries.set(String(key), normalizeEntry(value)));
  loaded = true;
  return true;
}

function ensureLoadedSync() {
  if (loaded) return;
  if (seedFromPreload()) return;
  if (!loading) loadEntries();
  // Without the boot gate (dev server) the async load may still arrive; spin
  // briefly, then continue with an empty tree instead of blocking startup.
  const deadline = Date.now() + 1500;
  while (!loaded && Date.now() < deadline) {
    /* bounded spin */
  }
  if (!loaded) loaded = true;
}

function scheduleFlush() {
  if (flushTimer) return;
  flushTimer = setTimeout(flush, 150);
}

function flush() {
  flushTimer = null;
  if (!dirty.size) return;
  const batch = [...dirty];
  dirty.clear();
  openIdb().then((idb) => {
    if (!idb) return;
    const tx = idb.transaction(IDB_STORE, 'readwrite');
    const store = tx.objectStore(IDB_STORE);
    for (const path of batch) {
      const entry = entries.get(path);
      if (entry) store.put(entry, path);
      else store.delete(path);
    }
    tx.oncomplete = () => idb.close();
    tx.onerror = () => idb.close();
  });
}

if (typeof addEventListener === 'function') {
  addEventListener('pagehide', flush);
}

// ---------------------------------------------------------------------------
// path helpers
// ---------------------------------------------------------------------------

function toPath(value) {
  if (value == null) return '';
  let path = String(value);
  if (path.startsWith('file://')) path = path.slice('file://'.length);
  path = path.replace(/\\/g, '/');
  if (path.length > 1 && path.endsWith('/')) path = path.slice(0, -1);
  if (!path.startsWith('/')) path = `/${path}`;
  return path;
}

// Segments may be strings, URIs, or Directory/File instances
// (`new Directory(Paths.document, 'SQLite')` passes an object).
function partToString(part) {
  if (part == null) return '';
  if (typeof part === 'string') return part;
  if (typeof part === 'object' && typeof part.uri === 'string') return part.uri;
  return String(part);
}

function join(parts) {
  const pieces = parts
    .filter((part) => part != null && part !== '')
    .map((part) => toPath(partToString(part)).replace(/^\/+|\/+$/g, ''))
    .filter(Boolean);
  return `/${pieces.join('/')}`;
}

function dirname(path) {
  if (path === '/') return '/';
  const index = path.lastIndexOf('/');
  return index <= 0 ? '/' : path.slice(0, index);
}

function baseName(path) {
  const index = path.lastIndexOf('/');
  return index === -1 ? path : path.slice(index + 1);
}

function children(path) {
  const prefix = path === '/' ? '/' : `${path}/`;
  const out = [];
  for (const key of entries.keys()) {
    if (!key.startsWith(prefix) || key === path) continue;
    const rest = key.slice(prefix.length);
    if (!rest || rest.includes('/')) continue;
    out.push(key);
  }
  return out;
}

function exists(path) {
  ensureLoadedSync();
  if (entries.has(path)) return true;
  const sizes = globalThis.__CHERRY_DB_FILES__;
  if (sizes && sizes.has(path)) return true;
  // sidecars (-wal / -shm) are never produced by the sql.js backend
  return false;
}

function sizeOf(path) {
  const entry = entries.get(path);
  if (entry && !entry.dir) {
    if (typeof entry.text === 'string') return entry.text.length;
    if (entry.bytes) return entry.bytes.length;
  }
  const sizes = globalThis.__CHERRY_DB_FILES__;
  return sizes && sizes.has(path) ? sizes.get(path) : 0;
}

function makeDir(path) {
  ensureLoadedSync();
  if (entries.has(path)) return;
  entries.set(path, { dir: true });
  dirty.add(path);
  scheduleFlush();
}

function removeTree(path) {
  ensureLoadedSync();
  const prefix = `${path}/`;
  for (const key of [...entries.keys()]) {
    if (key === path || key.startsWith(prefix)) {
      entries.delete(key);
      dirty.add(key);
    }
  }
  scheduleFlush();
}

// ---------------------------------------------------------------------------

class Directory {
  constructor(...segments) {
    this._path = join(segments);
  }

  get uri() {
    return `file://${this._path}/`;
  }

  get name() {
    return baseName(this._path);
  }

  get exists() {
    return exists(this._path);
  }

  get parentDirectory() {
    return new Directory(dirname(this._path));
  }

  create(options = {}) {
    if (options.intermediates) {
      const parts = this._path.split('/').filter(Boolean);
      let current = '';
      for (const part of parts) {
        current += `/${part}`;
        makeDir(current);
      }
    }
    makeDir(this._path);
  }

  delete() {
    removeTree(this._path);
  }

  list() {
    ensureLoadedSync();
    return children(this._path).map((path) =>
      entries.get(path) && entries.get(path).dir ? new Directory(path) : new File(path),
    );
  }

  info() {
    return {
      exists: this.exists,
      isDirectory: true,
      uri: this.uri,
      size: 0,
      modificationTime: 0,
    };
  }

  copy(destination) {
    const target = toPath(destination instanceof Directory ? destination.uri : destination);
    makeDir(target);
  }

  move(destination) {
    this.copy(destination);
    this.delete();
  }
}

class File {
  constructor(...segments) {
    this._path = join(segments);
  }

  get uri() {
    return `file://${this._path}`;
  }

  get name() {
    return baseName(this._path);
  }

  get exists() {
    return exists(this._path);
  }

  get size() {
    return sizeOf(this._path);
  }

  get type() {
    return '';
  }

  get parentDirectory() {
    return new Directory(dirname(this._path));
  }

  create(options = {}) {
    if (options.intermediates) new Directory(dirname(this._path)).create({ intermediates: true });
    ensureLoadedSync();
    if (!entries.has(this._path)) {
      entries.set(this._path, { text: '' });
      dirty.add(this._path);
      scheduleFlush();
    }
  }

  write(content, options) {
    ensureLoadedSync();
    if (typeof content === 'string') {
      entries.set(this._path, { text: content });
    } else if (content instanceof Uint8Array) {
      entries.set(this._path, { bytes: content });
    } else if (content instanceof ArrayBuffer) {
      entries.set(this._path, { bytes: new Uint8Array(content) });
    } else {
      entries.set(this._path, { text: String(content) });
    }
    dirty.add(this._path);
    scheduleFlush();
    if (options && options.append) {
      /* append handled above by overwrite; callers in this app do not append */
    }
  }

  text() {
    ensureLoadedSync();
    const entry = entries.get(this._path);
    return entry && typeof entry.text === 'string' ? entry.text : '';
  }

  textSync() {
    return this.text();
  }

  bytes() {
    ensureLoadedSync();
    const entry = entries.get(this._path);
    if (!entry) return new Uint8Array();
    if (entry.bytes) return entry.bytes;
    if (typeof entry.text === 'string') {
      const encoded = new TextEncoder().encode(entry.text);
      return encoded;
    }
    return new Uint8Array();
  }

  base64() {
    const bytes = this.bytes();
    let binary = '';
    for (let i = 0; i < bytes.length; i += 1) binary += String.fromCharCode(bytes[i]);
    return typeof btoa === 'function' ? btoa(binary) : '';
  }

  delete() {
    removeTree(this._path);
  }

  copy(destination) {
    ensureLoadedSync();
    const target = toPath(destination instanceof File ? destination.uri : destination);
    new Directory(dirname(target)).create({ intermediates: true });
    const entry = entries.get(this._path);
    if (entry) {
      entries.set(target, { ...entry });
      dirty.add(target);
      scheduleFlush();
    }
  }

  move(destination) {
    this.copy(destination);
    this.delete();
  }

  info() {
    return { exists: this.exists, isDirectory: false, uri: this.uri, size: this.size, modificationTime: 0 };
  }
}

const Paths = {
  get document() {
    return new Directory(DOCUMENT);
  },
  get cache() {
    return new Directory(CACHE);
  },
  get totalDiskSpace() {
    return 0;
  },
  get availableDiskSpace() {
    return Number.MAX_SAFE_INTEGER;
  },
  join: (...parts) => join(parts),
  basename: (path) => baseName(toPath(path)),
  dirname: (path) => dirname(toPath(path)),
  extname: (path) => {
    const name = baseName(toPath(path));
    const index = name.lastIndexOf('.');
    return index === -1 ? '' : name.slice(index);
  },
};

const FileMode = {
  read: 0,
  write: 1,
  append: 2,
  readWrite: 3,
  appendWrite: 4,
  readAppend: 5,
  readAppendWrite: 6,
};

// ---------------------------------------------------------------------------
// legacy promise API, mapped onto the same tree
// ---------------------------------------------------------------------------

async function getInfoAsync(uri, options = {}) {
  const path = toPath(uri);
  const fileExists = exists(path);
  return {
    exists: fileExists,
    uri: `file://${path}`,
    isDirectory: Boolean(entries.get(path) && entries.get(path).dir),
    size: options.size ? sizeOf(path) : undefined,
    modificationTime: 0,
  };
}

async function readAsStringAsync(uri) {
  return new File(uri).text();
}

async function writeAsStringAsync(uri, content) {
  new File(uri).write(content);
}

async function makeDirectoryAsync(uri, options = {}) {
  new Directory(uri).create({ intermediates: Boolean(options.intermediates) });
}

async function deleteAsync(uri, options = {}) {
  const path = toPath(uri);
  if (options.idempotent && !exists(path)) return;
  removeTree(path);
}

async function copyAsync({ from, to }) {
  new File(from).copy(to);
}

async function moveAsync({ from, to }) {
  new File(from).move(to);
}

async function readDirectoryAsync(uri) {
  return children(toPath(uri)).map(baseName);
}

const documentDirectory = `file://${DOCUMENT}/`;
const cacheDirectory = `file://${CACHE}/`;

module.exports = {
  Directory,
  File,
  Paths,
  FileMode,
  documentDirectory,
  cacheDirectory,
  getInfoAsync,
  readAsStringAsync,
  writeAsStringAsync,
  makeDirectoryAsync,
  deleteAsync,
  copyAsync,
  moveAsync,
  readDirectoryAsync,
  EncodingType: { UTF8: 'utf8', Base64: 'base64' },
};
module.exports.default = module.exports;
