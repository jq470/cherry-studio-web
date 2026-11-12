# Web build report

- run: 43249590493 (5043c0be14c7666be98afd00d79a6964a1237041)
- upstream: 714d071096589a4144e2c4dbbbf2b6e3827b998c
- diagnostic export: 
- size: 46 MB
- files: 654

## sqlite3 runtime
total 1512
drwxr-xr-x 2 runner runner   4096 Nov 12 15:39 .
drwxr-xr-x 5 runner runner   4096 Nov 12 15:39 ..
-rw-r--r-- 1 runner runner 656872 Nov 12 15:39 index.mjs
-rw-r--r-- 1 runner runner 879084 Nov 12 15:39 sqlite3.wasm

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
- boot wait: 2552 ms (first non-empty paint: 2552)
- dom nodes: 100
- title: Cherry Studio
- verdict: PASS (no startup failure markers)
- #root children: 1 | body text length: 324
- sqlite backend: ready
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
Welcome to Cherry Connect your AI service or sync your existing setup from your computer. Connect a provider Sync from desktop Set up later Cherry Studio Privacy and data Cherry Studio collects a small amount of anonymous data to understand how its features are used. Read the full privacy policy Accept and continue Decline
```

## react fiber tree
```
HostRoot
  o
    t
      Anonymous
        f
          f
            Anonymous
              Anonymous
                Anonymous
                  h
```

## #root html
```html
<div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-633pao"><div class="css-g5y9jx r-13awgt0"><div style="position: absolute; inset: 0px; pointer-events: none; visibility: hidden;"></div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af" style="background-color: rgb(245, 245, 245); display: flex;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0"><div style="position: absolute; inset: 0px; pointer-events: none; visibility: hidden;"></div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af" style="background-color: rgb(245, 245, 245); display: flex;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1" style="padding-left: 0px; padding-right: 0px;"><div class="css-g5y9jx w-full flex-1 self-center" style="max-width: 720px;"><div class="css-g5y9jx flex-1 bg-background" data-testid="onboarding-welcome" style="padding-top: 0px; padding-bottom: 0px;"><div class="css-g5y9jx r-150rngu r-eqz5dr r-16y2uox r-1wbh5a2 r-11yh6sk r-1rnoaur r-agouwx r-2eszeu"><div class="css-g5y9jx flex-grow justify-between gap-8 pb-4"><div class="css-g5y9jx flex-grow items-center justify-center gap-8 px-8 py-12"><div class="css-g5y9jx" style="height: 104px; width: 100.484px;"><div class="css-g5y9jx" style="left: -17.5846px; position: absolute; top: -18.2px; transform: translateY(-100px) scale(1);"></div></div><div class="css-g5y9jx items-center gap-3"><div class="css-g5y9jx" style="opacity: 0; transform: translateY(16px);"><h1 dir="auto" role="heading" class="css-146c3p1 text-center font-semibold text-3xl text-foreground">Welcome to Cherry</h1></div><div class="css-g5y9jx" style="opacity: 0; transform: translateY(16px);"><div dir="auto" class="css-146c3p1 text-cen
```

## startup stages
- none logged

## console tail (9 messages)
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 0 database(s), 0 file(s)
- [warn] Deprecated: prop 'getId' on screen files/[fileEntryId] is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [error] Access to fetch at 'https://raw.githubusercontent.com/CherryHQ/cherry-studio/refs/heads/x-files/provider-registry/v4/manifest.json' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Response to preflight request d…
- [error] Failed to load resource: net::ERR_FAILED
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.

## page errors (0)

## console errors (2)
- Access to fetch at 'https://raw.githubusercontent.com/CherryHQ/cherry-studio/refs/heads/x-files/provider-registry/v4/manifest.json' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: It does not have HTTP ok status.
- Failed to load resource: net::ERR_FAILED

## warnings (0)

## workers (0)
- none

## failed requests (1)
- GET https://raw.githubusercontent.com/CherryHQ/cherry-studio/refs/heads/x-files/provider-registry/v4/manifest.json :: net::ERR_FAILED

## bad responses (1)
- 403 https://raw.githubusercontent.com/CherryHQ/cherry-studio/refs/heads/x-files/provider-registry/v4/manifest.json

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-0bc6136ab1aeea68ea1a4b26cf9e6d5d.js
- http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js

## unknown module analysis (0)
- no mapping recovered
