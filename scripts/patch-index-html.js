#!/usr/bin/env node
/**
 * Inject the boot gate into an exported index.html.
 *
 * Why this exists: `expo-sqlite`'s synchronous API (`openDatabaseSync`) needs a
 * ready sql.js runtime *at call time*, but sql.js can only be initialised
 * asynchronously (WASM instantiation). Blocking inside a synchronous call does
 * not work - a synchronous XHR pump does not drain the microtask queue (measured
 * in headless Chromium: 20s of pumping, zero progress). Therefore the wait is
 * moved to page load: this gate initialises sql.js and preloads the IndexedDB
 * payloads, and only then injects the app bundle. By the time app code runs,
 * `globalThis.__SQLJS_MODULE__` and `globalThis.__CHERRY_PRELOAD__` are present,
 * so `openDatabaseSync` is genuinely synchronous.
 *
 * Usage: node scripts/patch-index-html.js <dist-dir>
 */
'use strict';

const fs = require('fs');
const path = require('path');

const target = process.argv[2] || 'dist-web';
const indexPath = path.join(target, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error(`[gate] ${indexPath} not found`);
  process.exit(1);
}

let html = fs.readFileSync(indexPath, 'utf8');

// Expo web export emits one <script src=".../_expo/static/js/web/*.js"> per
// runtime chunk. Capture them in document order, then remove the tags.
const SCRIPT_RE = /<script\b[^>]*\bsrc="([^"]+_expo\/static\/js\/web\/[^"]+\.js)"[^>]*>\s*<\/script>/g;
const found = [...html.matchAll(SCRIPT_RE)];

if (!found.length) {
  console.error('[gate] no expo web entry scripts found in index.html');
  process.exit(1);
}

const entries = found.map((match) => match[1]);
html = html.replace(SCRIPT_RE, '');

const gate = `<script id="cherry-web-gate">
${buildGate(entries)}
</script>`;

if (!/<\/body>/i.test(html)) {
  console.error('[gate] index.html has no </body>');
  process.exit(1);
}
html = html.replace(/<\/body>/i, `${gate}\n</body>`);

fs.writeFileSync(indexPath, html);
console.log(`[gate] gated ${entries.length} script(s):`);
for (const entry of entries) console.log(`  - ${entry}`);

function buildGate(scripts) {
  return `(function () {
  var scripts = ${JSON.stringify(scripts)};
  var SQLJS_DIR = 'sqljs/';

  function log() {
    try { console.log.apply(console, ['[web-gate]'].concat([].slice.call(arguments))); } catch (error) {}
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      var el = document.createElement('script');
      el.src = src;
      el.async = false;
      el.onload = function () { resolve(src); };
      el.onerror = function () { reject(new Error('failed to load ' + src)); };
      document.head.appendChild(el);
    });
  }

  function withTimeout(promise, ms, label) {
    return new Promise(function (resolve, reject) {
      var settled = false;
      var timer = setTimeout(function () {
        if (settled) return;
        settled = true;
        reject(new Error(label + ' timed out after ' + ms + 'ms'));
      }, ms);
      promise.then(function (value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        resolve(value);
      }, function (error) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        reject(error);
      });
    });
  }

  function openDb(name, store) {
    return new Promise(function (resolve) {
      if (typeof indexedDB === 'undefined') { resolve(null); return; }
      try {
        var request = indexedDB.open(name, 1);
        request.onupgradeneeded = function () {
          var db = request.result;
          if (!db.objectStoreNames.contains(store)) db.createObjectStore(store);
        };
        request.onsuccess = function () { resolve(request.result); };
        request.onerror = function () { resolve(null); };
      } catch (error) { resolve(null); }
    });
  }

  function readAll(name, store) {
    return openDb(name, store).then(function (db) {
      if (!db) return new Map();
      return new Promise(function (resolve) {
        var out = new Map();
        try {
          var request = db.transaction(store, 'readonly').objectStore(store).openCursor();
          request.onerror = function () { db.close(); resolve(out); };
          request.onsuccess = function () {
            var cursor = request.result;
            if (!cursor) { db.close(); resolve(out); return; }
            out.set(String(cursor.key), cursor.value);
            cursor.continue();
          };
        } catch (error) { db.close(); resolve(out); }
      });
    });
  }

  function boot() {
    var sqliteReady = loadScript(SQLJS_DIR + 'sql-wasm.js')
      .then(function () {
        var init = window.initSqlJs;
        if (typeof init !== 'function') throw new Error('initSqlJs missing');
        return withTimeout(init({ locateFile: function (file) { return SQLJS_DIR + file; } }), 30000, 'sql.js init');
      })
      .then(function (mod) {
        window.__SQLJS_MODULE__ = mod;
        window.__CHERRY_SQLITE__ = 'ready';
        log('sql.js ready');
      })
      .catch(function (error) {
        window.__CHERRY_SQLITE__ = 'failed:' + (error && error.message ? error.message : error);
        log('sql.js init failed', error);
      });

    return sqliteReady
      .then(function () { return readAll('cherry-studio-sqlite', 'databases').catch(function () { return new Map(); }); })
      .then(function (sqlite) {
        return readAll('cherry-studio-fs', 'entries')
          .catch(function () { return new Map(); })
          .then(function (fsEntries) {
            window.__CHERRY_PRELOAD__ = { sqlite: sqlite, fs: fsEntries };
            log('preloaded', sqlite.size, 'database(s),', fsEntries.size, 'file(s)');
          });
      })
      .then(function () {
        return scripts.reduce(function (chain, src) {
          return chain.then(function () { return loadScript(src); }).catch(function (error) {
            log('bundle load failed', src, error);
          });
        }, Promise.resolve());
      });
  }

  boot();
})();`;
}
