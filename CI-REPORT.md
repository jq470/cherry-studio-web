# Web build report

- run: 43242713576 (df24c8a0dec9b73b8c9376371d6d54b32c08b399)
- upstream: 714d071096589a4144e2c4dbbbf2b6e3827b998c
- diagnostic export: 
- size: 46 MB
- files: 654

## sqlite3 runtime
total 1512
drwxr-xr-x 2 runner runner   4096 Nov 12 15:01 .
drwxr-xr-x 5 runner runner   4096 Nov 12 15:01 ..
-rw-r--r-- 1 runner runner 656872 Nov 12 15:01 index.mjs
-rw-r--r-- 1 runner runner 879084 Nov 12 15:01 sqlite3.wasm

## js chunks
./_expo/static/js/web/remote-f532e04fbc8e152225cfd7627be86216.js
./_expo/static/js/web/pair-572cbb462346ec431aa51c0feedf9155.js
./_expo/static/js/web/web-search-4f2211264c029c9f086f8c3d1ed06749.js
./_expo/static/js/web/edit-46fb22ca5ce19efeb4d4a873ff6a7d1d.js
./_expo/static/js/web/files-b5c23b002187edf3bb1c0e5006870358.js
./_expo/static/js/web/desktop-sync-a492c756b4f6b96a0cbd05b0fec649e2.js
./_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
./_expo/static/js/web/index-214c563e120a3d87bd42c1477284c679.js
./_expo/static/js/web/index-7138a22aa47bae477da6d48bfc17bc6b.js
./_expo/static/js/web/provider-sync-85c961b359e018527b4228fc31dbb733.js
./_expo/static/js/web/about-3e7b1c4aa927d4fef7467f6fe592ac16.js
./_expo/static/js/web/azure-openai-responses-6e60b218fc2dc965d2ff308c59ff46bb.js
./_expo/static/js/web/notifications-a735af5eec661f818f20e4a32d143f06.js
./_expo/static/js/web/trash-7a2d54b1df167f084938b0b608e53964.js
./_expo/static/js/web/_layout-21ae8887fe29682e0dc834c60b3dee2a.js
./_expo/static/js/web/index-111d425fada28c54842dffc7bcece297.js
./_expo/static/js/web/new-96e6ba2bffcd3bf28901f0c9003f0285.js
./_expo/static/js/web/templates-c329eddff042fbbb2fe773d23051c9fe.js
./_expo/static/js/web/privacy-f174e89ff118fc51905afe72f1fcb4c3.js
./_expo/static/js/web/[marketplaceId]-b49bb394baa9942d3608c70fdb22cb1f.js

## wasm assets
./sqlite3/sqlite3.wasm

## runtime smoke
# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 47141 ms (first non-empty paint: never)
- dom nodes: 19
- title: Cherry Studio
- verdict: FAIL: body text too short
- #root children: 1 | body text length: 0
- sqlite backend: ready
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
(empty)
```

## #root html
```html
<div class="css-g5y9jx r-13awgt0"></div>
```

## startup stages
- none logged

## console tail (2 messages)
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 0 database(s), 0 file(s)

## page errors (0)

## console errors (0)

## warnings (0)

## workers (0)
- none

## failed requests (0)

## bad responses (0)

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-0bc6136ab1aeea68ea1a4b26cf9e6d5d.js
- http://127.0.0.1:8099/_expo/static/js/web/index-e9f8b146111dafe53ed5194a6cfbcaec.js

## unknown module analysis (0)
- no mapping recovered
