# Cherry Studio Web

Browser port of [CherryHQ/cherry-studio-app](https://github.com/CherryHQ/cherry-studio-app) (Expo + React Native).

This repository contains **no application code**. It is an overlay: CI clones upstream at a pinned commit, applies two config patches plus a platform shim layer, exports a static SPA, smoke-tests it in headless Chrome, and uploads a deployable `dist-web` artifact.

## How it works

```
upstream (pinned commit, cloned in CI)
  + overlay/src/web-shims/*      # browser implementations for native modules
  + scripts/patch-app-config.js  # expo.web.output = single
  + scripts/patch-metro.js       # shim resolver + RN internals + RNW packaging fix
  = expo export --platform web -> dist-web
  + scripts/patch-index-html.js  # boot gate: SQLite WASM before the app bundle
  + sqlite3/{index.mjs,sqlite3.wasm}   # vendored in CI
```

Nothing under upstream's `src/` is ever modified. Business code stays untouched.

## Why a boot gate instead of a polyfill

The app calls `openDatabaseSync`. SQLite WASM can only be initialised asynchronously,
and **a synchronous call cannot wait for a Promise** - a sync-XHR pump does not drain
the microtask queue (measured in headless Chromium: 20s of pumping, zero progress).
So the wait lives in the page: `scripts/patch-index-html.js` rewrites `index.html` to
hold the app bundle until the runtime and IndexedDB payloads are ready, then injects
the originally emitted scripts. App code then sees an already-ready runtime.

## Database on web

`expo-sqlite`'s official web backend runs wa-sqlite inside a Worker and blocks on
`SharedArrayBuffer` + `Atomics`. Under a Metro static export the worker is wrapped as
a `blob:` script and never answers, so every `openDatabaseSync()` throws
`Sync operation timeout`. This overlay swaps in the official
[`@sqlite.org/sqlite-wasm`](https://www.npmjs.com/package/@sqlite.org/sqlite-wasm)
build (FTS5 + RTREE + JSON1) on the main thread, persisting the database bytes to
IndexedDB. `INSERT ... RETURNING` works, which drizzle's `insertWithOrderKey` needs.

> sql.js was tried first and rejected: its stock build has no FTS5/RTREE, and
> `DbService.runCustomMigrations()` creates FTS5 tables on the startup path, so the
> app could not boot.

## Run a build

Triggered on every push to `main`. Manual run:

```
Actions -> web-build -> Run workflow
  diagnostic = true   # dev bundle, no minify, external source maps
```

Artifact: `cherry-studio-web` (the whole `dist-web` directory).

## Preview locally

```bash
node web-adaptation/static-server.js dist-web 8099
```

Serves `.wasm` with the correct MIME type, sends COOP/COEP, falls back to
`index.html` for SPA routes.

## Deploy

Static host + CORS proxy. Model providers do not send CORS headers for browser
origins, so production needs the tiny proxy in `server/` (base URL becomes
`https://<host>/api.openai.com/v1`). `server/cors-proxy.js` serves the SPA and proxies
in one process; there is also a Cloudflare Worker variant. See [DEPLOY.md](DEPLOY.md).

Requirements: site-root deployment (absolute `/assets`, `/sqlite3` paths), SPA fallback,
and `sqlite3/sqlite3.wasm` served as `application/wasm`.

## Known limitations

* Camera, photo library, notifications, widgets, background tasks, native share,
  system TTS, on-device ASR, Skia canvas: stubbed out (unavailable on web).
* Files imported through the app live in a virtual filesystem backed by IndexedDB;
  they do not touch the real disk.
* No code splitting beyond the router's per-route chunks, so the first load is heavy.
* Provider API calls need the CORS proxy; a direct browser call fails preflight.

See [overlay/docs/WEB-ADAPTATION.md](overlay/docs/WEB-ADAPTATION.md) for the per-module
rationale.
