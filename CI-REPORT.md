# Web build report

- run: 43254210687 (2404f43afac691808179e9d3e13505d35936f1d5)
- upstream: 714d071096589a4144e2c4dbbbf2b6e3827b998c
- diagnostic export: 
- size:  MB
- files: 0

## sqlite3 runtime
missing

## js chunks

## wasm assets

## runtime smoke
# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 3800 ms (first non-empty paint: 3800)
- dom nodes: 42
- title: Cherry Studio
- verdict: PASS (no startup failure markers)
- #root children: 1 | body text length: 140
- sqlite backend: ready
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
Something went wrong This screen ran into a problem. Try again. If this keeps happening, close Cherry Studio completely and reopen it. Retry
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
<div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-105ug2t"><div class="css-g5y9jx r-13awgt0"><div aria-live="polite" class="css-g5y9jx flex-1 items-center justify-center bg-background px-8"><div class="css-g5y9jx items-center justify-center gap-4"><div class="css-g5y9jx max-w-full gap-1.5 items-center"><div dir="auto" class="css-146c3p1 text-center font-semibold text-lg text-error r-1xnzce8">Something went wrong</div><div dir="auto" class="css-146c3p1 text-center text-muted-foreground text-sm r-1xnzce8">This screen ran into a problem. Try again. If this keeps happening, close Cherry Studio completely and reopen it.</div></div><div class="css-g5y9jx flex-row flex-wrap items-center gap-3 justify-center"><button role="button" tabindex="0" class="css-g5y9jx r-1loqt21 r-1otgn73 flex-row items-center justify-center overflow-hidden border-0 active:opacity-80 disabled:opacity-40 bg-foreground shadow-xs rounded-full gap-2 px-4 py-2.5" type="button"><div dir="auto" class="css-146c3p1 min-w-0 shrink text-center font-medium text-base text-background">Retry</div></button></div></div></div></div></div></div></div></div></div></div></div>
```

## interaction
```
privacy accept clicked: true
skip setup clicked: true
onboarding dismissed: true
```

## reload (persistence)
```
- sqlite: ready
- elapsed: 1604 ms
- welcome screen returned: false
- text: Something went wrong This screen ran into a problem. Try again. If this keeps happening, close Cherry Studio completely and reopen it. Retry Cherry Studio
```

## startup stages
- none logged

## console tail (24 messages)
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 0 database(s), 0 file(s)
- [warn] Deprecated: prop 'getId' on screen files/[fileEntryId] is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [error] TypeError: o.get is not a function
- [error] Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- [error] Failed to load resource: net::ERR_FAILED
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 2 database(s), 9 file(s)
- [warn] Deprecated: prop 'getId' on screen files/[fileEntryId] is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [error] TypeError: (0 , r(...).codegenNativeComponent) is not a function
- [error] Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- [error] Failed to load resource: net::ERR_FAILED

## page errors (0)

## console errors (6)
- TypeError: o.get is not a function
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- TypeError: (0 , r(...).codegenNativeComponent) is not a function
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (3)
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED
- GET http://127.0.0.1:8099/api.gitcode.com/api/v5/repos/CherryHQ/cherry-studio/raw/v4%2Fmanifest.json?ref=x-files%2Fprovider-registry :: net::ERR_ABORTED
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED

## workers (0)
- none

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-0bc6136ab1aeea68ea1a4b26cf9e6d5d.js
- http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js
- http://127.0.0.1:8099/sqlite3/sqlite3.wasm
- http://127.0.0.1:8099/_expo/static/js/web/_layout-aab386dd34d12ff606522fc811eff1e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-53501e52582fd2edbc769c33d0d405e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-ce65163132c001c93990acf79cd18f44.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
- http://127.0.0.1:8099/_expo/static/js/web/index-43a609c9e85702b33c3c35ac0a3a9a53.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-96f4b2821f567ae5339167974df76759.js
- http://127.0.0.1:8099/_expo/static/js/web/index-f9384db76673e101b7654ff4595eb18b.js
