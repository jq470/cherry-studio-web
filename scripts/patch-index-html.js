#!/usr/bin/env node
/**
 * Inject the boot gate into an exported index.html.
 *
 * Why this exists: `expo-sqlite`'s synchronous API (`openDatabaseSync`) needs a
 * ready SQLite WASM runtime *at call time*, but it can only be initialised
 * asynchronously (WASM instantiation). Blocking inside a synchronous call does
 * not work - a synchronous XHR pump does not drain the microtask queue (measured
 * in headless Chromium: 20s of pumping, zero progress). Therefore the wait is
 * moved to page load: this gate initialises the runtime and preloads the IndexedDB
 * payloads, and only then injects the app bundle. By the time app code runs,
 * `globalThis.__SQLITE3__` and `globalThis.__CHERRY_PRELOAD__` are present,
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
  if (html.includes('cherry-web-gate')) {
    console.log('[gate] already gated, nothing to do');
    process.exit(0);
  }
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
  // Root-relative on purpose: on a deep route (/settings/provider/new) a
  // relative 'sqlite3/' resolves under that route, the static server answers
  // index.html and the module import fails its MIME check - the app then shows
  // its startup-failure screen. Always resolve against the origin.
  var SQLITE_DIR = location.origin + '/sqlite3/';

  // The exported app is phone-first: a bottom-sheet dialog taller than the
  // remaining viewport extends past body height, and expo-reset hides body
  // overflow, which leaves the privacy buttons unreachable on a desktop window.
  // Letting the document scroll vertically is the least invasive fix; the app's
  // own ScrollViews keep their internal scrolling.
  try {
    var layoutStyle = document.createElement('style');
    layoutStyle.id = 'cherry-web-layout';
    layoutStyle.textContent = 'html,body{overflow-x:hidden !important;overflow-y:auto !important}';
    document.head.appendChild(layoutStyle);
  } catch (error) {}

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

  function loadSqlite() {
    return Promise.resolve()
      .then(function () { return import(SQLITE_DIR + 'index.mjs'); })
      .then(function (mod) {
        // The package's default export is the init function: sqlite3InitModule.
        return mod.default({ print: function () {}, printErr: function () {} });
      });
  }

  // GitHub-hosted registry/skill files do not send CORS headers for browser
  // origins. With server/cors-proxy.js in front of the site the same path is
  // reachable as /<host>/<path>, so rewrite only those static-content hosts.
  var PROXIED_HOSTS = {
    'raw.githubusercontent.com': 1,
    'objects.githubusercontent.com': 1,
    'api.gitcode.com': 1,
  };

  // Anonymous telemetry is fire-and-forget and its endpoint refuses CORS
  // preflights from browser origins. Answer locally so the console stays clean
  // and no request leaves the page; it carries no product functionality.
  var SUPPRESSED_HOSTS = {
    'analytics.cherry-ai.com': 1,
  };

  function installProxyRewrite() {
    if (typeof window === 'undefined' || typeof window.fetch !== 'function') return;
    var nativeFetch = window.fetch.bind(window);
    window.fetch = function (input, init) {
      try {
        var url = typeof input === 'string' ? input : input && input.url;
        if (url) {
          var parsed = new URL(url, location.href);
          if (SUPPRESSED_HOSTS[parsed.hostname] && parsed.origin !== location.origin) {
            return Promise.resolve(new Response(null, { status: 204, statusText: 'No Content' }));
          }
          if (PROXIED_HOSTS[parsed.hostname] && parsed.origin !== location.origin) {
            return nativeFetch(location.origin + '/' + parsed.hostname + parsed.pathname + parsed.search, init);
          }
        }
      } catch (error) {
        /* fall through to the original request */
      }
      return nativeFetch(input, init);
    };
  }

  // Production bundles only reach the console as minified messages, which makes
  // a TypeError impossible to attribute. Attach the Error's own stack (chunk
  // file + line survive minification) to the same console call.
  function installErrorStacks() {
    if (typeof console === 'undefined') return;
    var NL = String.fromCharCode(10);
    var nativeError = console.error.bind(console);
    console.error = function () {
      try {
        var args = [].slice.call(arguments);
        for (var i = 0; i < args.length; i += 1) {
          var value = args[i];
          if (value && typeof value === 'object' && typeof value.stack === 'string' && value.stack.indexOf(NL) !== -1) {
            nativeError.apply(console, args);
            // One line per frame: the smoke report truncates long messages, and a
            // joined stack hides exactly the frame that names the module.
            var frames = value.stack.split(NL).slice(0, 14);
            for (var j = 0; j < frames.length; j += 1) {
              try { console.log('[stack-frame] ' + frames[j].slice(0, 220)); } catch (error) {}
            }
            return;
          }
        }
      } catch (error) {}
      return nativeError.apply(console, args);
    };
  }

  function boot() {
    installErrorStacks();
    installProxyRewrite();
    var sqliteReady = withTimeout(loadSqlite(), 30000, 'sqlite wasm init')
      .then(function (sqlite3) {
        window.__SQLITE3__ = sqlite3;
        window.__CHERRY_SQLITE__ = 'ready';
        log('sqlite ready');
      })
      .catch(function (error) {
        window.__CHERRY_SQLITE__ = 'failed:' + (error && error.message ? error.message : error);
        log('sqlite init failed', error);
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
