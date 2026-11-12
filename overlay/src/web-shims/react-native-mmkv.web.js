// react-native-mmkv on web: a localStorage-backed equivalent.
//
// The native package is a JSI/TurboModule with no browser implementation. The
// app uses it as a synchronous key-value cache (settings, caches, journals), so
// localStorage gives the same semantics with persistence across reloads.
'use strict';

function encode(value) {
  if (value instanceof ArrayBuffer) return { t: 'buffer', v: Array.from(new Uint8Array(value)) };
  if (value instanceof Uint8Array) return { t: 'buffer', v: Array.from(value) };
  return { t: typeof value, v: value };
}

function decode(raw) {
  if (raw === null) return undefined;
  try {
    const parsed = JSON.parse(raw);
    if (parsed.t === 'buffer') return new Uint8Array(parsed.v).buffer;
    return parsed.v;
  } catch {
    return undefined;
  }
}

class MMKV {
  constructor(config = {}) {
    this.id = (config && config.id) || 'mmkv.default';
    this._prefix = `mmkv:${this.id}:`;
  }

  _storage() {
    return typeof localStorage === 'undefined' ? null : localStorage;
  }

  _read(key) {
    const storage = this._storage();
    return storage ? decode(storage.getItem(this._prefix + key)) : undefined;
  }

  set(key, value) {
    const storage = this._storage();
    if (storage) storage.setItem(this._prefix + key, JSON.stringify(encode(value)));
  }

  getString(key) {
    const value = this._read(key);
    return typeof value === 'string' ? value : undefined;
  }

  getNumber(key) {
    const value = this._read(key);
    return typeof value === 'number' ? value : undefined;
  }

  getBoolean(key) {
    const value = this._read(key);
    return typeof value === 'boolean' ? value : undefined;
  }

  getBuffer(key) {
    const value = this._read(key);
    return value instanceof ArrayBuffer ? value : undefined;
  }

  contains(key) {
    const storage = this._storage();
    return Boolean(storage && storage.getItem(this._prefix + key) !== null);
  }

  getAllKeys() {
    const storage = this._storage();
    if (!storage) return [];
    const keys = [];
    for (let i = 0; i < storage.length; i += 1) {
      const key = storage.key(i);
      if (key && key.startsWith(this._prefix)) keys.push(key.slice(this._prefix.length));
    }
    return keys;
  }

  delete(key) {
    const storage = this._storage();
    if (storage) storage.removeItem(this._prefix + key);
  }

  clearAll() {
    const storage = this._storage();
    if (!storage) return;
    for (const key of this.getAllKeys()) this.delete(key);
  }

  recrypt() {
    /* no-op */
  }

  get size() {
    return this.getAllKeys().length;
  }

  get isReadOnly() {
    return false;
  }
}

function createMMKV(config) {
  return new MMKV(config);
}

module.exports = { MMKV, createMMKV };
module.exports.default = module.exports;
