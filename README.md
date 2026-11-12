# Cherry Studio Web

Browser port of [CherryHQ/cherry-studio-app](https://github.com/CherryHQ/cherry-studio-app) (Expo + React Native).

This repository contains **no application code**. It is an overlay: CI clones upstream at a pinned commit, applies two config patches plus a platform shim layer, exports a static SPA, smoke-tests it in headless Chrome, and uploads a deployable `dist-web` artifact.

## How it works

```
upstream (pinned commit, cloned in CI)
   + overlay/src/web-shims/*        # browser implementations for native modules
   + scripts/patch-app-config.js    # expo.web.output = single
   + scripts/patch-metro.js         # shim resolver + RN internals + RNW packaging fix
   = expo export --platform web -> dist-web
```

Nothing under upstream's `src/` is ever modified. Business code stays untouched.

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
# or, after applying the overlay into a checkout:
node upstream/web-adaptation/static-server.js upstream/dist-web 8099
```

`static-server.js` serves `.wasm` with the correct MIME type, sends COOP/COEP so
`SharedArrayBuffer` remains available, and falls back to `index.html` for SPA
routes.

## Deploy

Any static host works (Cloudflare Pages, Netlify, Vercel, Nginx). Requirements:

* serve at the **site root** - the bundle references `/assets/...` and `/sqljs/...`
  with absolute paths, so a sub-path deployment 404s;
* SPA fallback: unknown routes must return `index.html`;
* `sqljs/sql-wasm.js` + `sqljs/sql-wasm.wasm` must be present (CI vendors them).

GitHub Pages additionally needs Settings -> Pages -> Source = GitHub Actions (a one-time
manual click; the connector has no permission to toggle it).

## Database on web

`expo-sqlite`'s official web backend runs wa-sqlite inside a Worker and blocks on
`SharedArrayBuffer` + `Atomics`. Under a Metro static export the worker is wrapped
as a `blob:` script and never answers, so the app dies with
`Sync operation timeout`. This overlay replaces the module with **sql.js**
(real SQLite compiled to WASM) executed on the main thread, persisting database
bytes to IndexedDB. `INSERT ... RETURNING` works, which drizzle's
`insertWithOrderKey` requires.

## Known limitations

* Camera, photo library, notifications, widgets, background tasks, native share,
  system TTS, on-device ASR, Skia canvas: stubbed out (unavailable on web).
* Files imported through the app live in a virtual filesystem; it persists to
  IndexedDB but does not touch the real disk.
* No code splitting: the whole app is one bundle, so first load is heavy.

See [overlay/docs/WEB-ADAPTATION.md](overlay/docs/WEB-ADAPTATION.md) for the per-module
rationale and [PLAN.md](PLAN.md) for the full design.
