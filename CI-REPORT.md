# Web build report

- run: 43327189689 (d0504191519184aff0d3ce4d53b534c084045b3a)
- upstream: 714d071096589a4144e2c4dbbbf2b6e3827b998c
- diagnostic export: 
- stage: smoke
- size: 46 MB
- files: 654

## clone log (tail)
```
upstream commit: 714d071096589a4144e2c4dbbbf2b6e3827b998c
upstream app: 0.5.4 | expo ~58.0.22 | rn 0.88.1
```

## install log (tail)
```
devDependencies:
+ @babel/core 7.29.7
+ @babel/generator 7.29.7
+ @babel/plugin-proposal-decorators 8.0.2
+ @babel/preset-typescript 7.29.7
+ @babel/traverse 7.29.7
+ @gorhom/bottom-sheet 5.2.14
+ @j178/prek 0.4.6
+ @react-native-async-storage/async-storage 2.2.0
+ @react-native-community/datetimepicker 9.2.1
+ @react-native/jest-preset 0.88.1
+ @react-native/metro-config 0.88.1
+ @sentry/cli 3.8.2
+ @storybook/addon-ondevice-actions 10.5.1
+ @storybook/addon-ondevice-controls 10.5.1
+ @storybook/react-native 10.5.1
+ @types/jest 30.0.0
+ @types/node 25.9.5
+ @types/react 19.3.0
+ @types/ws 8.18.1
+ babel-plugin-inline-import 3.0.0
+ babel-preset-expo 58.0.23
+ drizzle-kit 0.31.10
+ eas-cli 24.4.2
+ eas-cli-local-build-plugin 24.3.0
+ eslint 9.39.4
+ eslint-config-expo 58.0.4
+ jest 30.5.2
+ jest-expo 58.0.13
+ node-addon-api 8.9.1
+ node-gyp 11.5.0
+ oxfmt 0.61.0
+ oxlint 1.76.0
+ react-test-renderer 19.3.0
+ sharp 0.35.5
+ storybook 10.5.1
+ tsx 4.22.0
+ typescript 6.0.3

Done in 43s using pnpm v12.2.1
```

## overlay log (tail)
```
patched /home/runner/work/cherry-studio-web/cherry-studio-web/upstream/app.json: expo.web = {"output":"single","favicon":"./assets/icon.png","bundler":"metro"}
patched /home/runner/work/cherry-studio-web/cherry-studio-web/upstream/metro.config.js with 34 web shims
shims: 9 files
app.json web: {"output":"single","favicon":"./assets/icon.png","bundler":"metro"}
```

## export log (tail)
```
_expo/static/js/web/model-6f0c1b76c7c9b95f33767291197697dd.js (6.4KB)
_expo/static/js/web/model-add-a510c7f39a65595ad9d9f96504910466.js (32KB)
_expo/static/js/web/new-0a05a205695e08b35ba25919ec3f7d5f.js (568B)
_expo/static/js/web/new-1194a0637f044816cc8a2313ffb65937.js (560B)
_expo/static/js/web/new-96e6ba2bffcd3bf28901f0c9003f0285.js (561B)
_expo/static/js/web/node-535a1dbf61d4e5f60a998028cbdb1122.js (2.8KB)
_expo/static/js/web/node-9e34eef653f7993ae9b0bb9713e86377.js (1.3KB)
_expo/static/js/web/notifications-a735af5eec661f818f20e4a32d143f06.js (4.2KB)
_expo/static/js/web/oauth-callback-4cbb6e2275ac8f61be44dcaf0c5d1eda.js (568B)
_expo/static/js/web/officeText-2053456a5d632f917e164d9d8896db38.js (594KB)
_expo/static/js/web/openai-codex-d688570404d9f8af55e28f458b3a8fcc.js (6.4KB)
_expo/static/js/web/openai-codex-responses-daa03022cbb58babc1d2f6f01f68482c.js (25KB)
_expo/static/js/web/openai-completions-6788357d562e6c9f44e6aeb63d4a08e9.js (25KB)
_expo/static/js/web/openai-responses-61ee35597605ab1ac9451c95c1507efe.js (8.2KB)
_expo/static/js/web/pair-572cbb462346ec431aa51c0feedf9155.js (751B)
_expo/static/js/web/pair-5b347a5c3c17c31dc4f84d0e744b348a.js (575B)
_expo/static/js/web/piVertexAnthropic-e68e60d31d86d56bc8cc4b2dcea036b0.js (12KB)
_expo/static/js/web/privacy-f174e89ff118fc51905afe72f1fcb4c3.js (2.4KB)
_expo/static/js/web/profile-306745a37b2d697e93f0af2bb59dfc5f.js (3.9KB)
_expo/static/js/web/provider-0671c4571916cde9dcc1d4f85675a0f5.js (743B)
_expo/static/js/web/provider-sync-85c961b359e018527b4228fc31dbb733.js (747B)
_expo/static/js/web/remote-f532e04fbc8e152225cfd7627be86216.js (40KB)
_expo/static/js/web/remoteCrypto-34ae64d3af174d6ee209b03e53df6f44.js (1.2KB)
_expo/static/js/web/scan-6f8b0cccdd9655bb38360f4940db5def.js (751B)
_expo/static/js/web/scan-f4b9c4e14a6429d72e3c53a502389349.js (575B)
_expo/static/js/web/search-3ce78642f8a7f10fb67e0ea537cb5bfe.js (558B)
_expo/static/js/web/share-2f0680b1aee53bff98ad163b9d662bb7.js (67KB)
_expo/static/js/web/share-destination-28c75f65f923f7bb56d4304e2e5b3a89.js (3KB)
_expo/static/js/web/templates-c329eddff042fbbb2fe773d23051c9fe.js (573B)
_expo/static/js/web/trash-7a2d54b1df167f084938b0b608e53964.js (13KB)
_expo/static/js/web/voice-a2a8aeaeb07539b442a586c0e39e2aab.js (18KB)
_expo/static/js/web/web-search-4f2211264c029c9f086f8c3d1ed06749.js (565B)
_expo/static/js/web/xai-a1345ba89bae466fd1f6725a2ed751ef.js (3.2KB)

› Files (3):
favicon.ico (15KB)
index.html (1.6KB)
metadata.json (49B)

Exported: dist-web
```

## gate log (tail)
```
[gate] gated 3 script(s):
  - /_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
  - /_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js
  - /_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js
```

## smoke log (tail)
```
- [log] [stack-frame] at o (http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:2264:252)
- [log] [stack-frame] at _o (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:57061)

## page errors (0)

## console errors (8)
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- TypeError: o.get is not a function
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- TypeError: (0 , r(...).codegenNativeComponent) is not a function

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (3)
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED

## workers (0)
- none

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js
- http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js
- http://127.0.0.1:8099/sqlite3/sqlite3.wasm
- http://127.0.0.1:8099/_expo/static/js/web/_layout-aab386dd34d12ff606522fc811eff1e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-53501e52582fd2edbc769c33d0d405e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-ce65163132c001c93990acf79cd18f44.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
- http://127.0.0.1:8099/_expo/static/js/web/index-43a609c9e85702b33c3c35ac0a3a9a53.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-96f4b2821f567ae5339167974df76759.js
- http://127.0.0.1:8099/_expo/static/js/web/index-f9384db76673e101b7654ff4595eb18b.js
```

## sqlite3 runtime
total 1512
drwxr-xr-x 2 runner runner   4096 Nov 12 23:17 .
drwxr-xr-x 5 runner runner   4096 Nov 12 23:17 ..
-rw-r--r-- 1 runner runner 656872 Nov 12 23:17 index.mjs
-rw-r--r-- 1 runner runner 879084 Nov 12 23:17 sqlite3.wasm

## js chunks
./_expo/static/js/web/share-destination-28c75f65f923f7bb56d4304e2e5b3a89.js
./_expo/static/js/web/font-size-00189b10f50af368b1046ac6d6494748.js
./_expo/static/js/web/remote-f532e04fbc8e152225cfd7627be86216.js
./_expo/static/js/web/index-43a609c9e85702b33c3c35ac0a3a9a53.js
./_expo/static/js/web/scan-6f8b0cccdd9655bb38360f4940db5def.js
./_expo/static/js/web/connect-5526245f92be7b02794989fd16ac54b8.js
./_expo/static/js/web/[paintingId]-1b6e0ffb5bf4234eb8382de324241a63.js
./_expo/static/js/web/notifications-a735af5eec661f818f20e4a32d143f06.js
./_expo/static/js/web/index-a9573d8ec3db6b7b10d16527ddf940f4.js
./_expo/static/js/web/index-111d425fada28c54842dffc7bcece297.js
./_expo/static/js/web/model-2dbac4681f26394e83c1176a3e0f4028.js
./_expo/static/js/web/files-b5c23b002187edf3bb1c0e5006870358.js
./_expo/static/js/web/[serverId]-9fc3a6e2c78277ac9c2db0586184a120.js
./_expo/static/js/web/oauth-callback-4cbb6e2275ac8f61be44dcaf0c5d1eda.js
./_expo/static/js/web/data-0d21e5f32f9cb7eb3bb9821807df465d.js
./_expo/static/js/web/_layout-3f0386dbf11505f354d6bc94b8100e85.js
./_expo/static/js/web/openai-responses-61ee35597605ab1ac9451c95c1507efe.js
./_expo/static/js/web/[permission]-59eb6b499c48d85f7a2c64ff5ae19748.js
./_expo/static/js/web/web-search-4f2211264c029c9f086f8c3d1ed06749.js
./_expo/static/js/web/provider-sync-85c961b359e018527b4228fc31dbb733.js

## wasm assets
./sqlite3/sqlite3.wasm

## runtime smoke
# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 2761 ms (first non-empty paint: 2761)
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
- elapsed: 1421 ms
- welcome screen returned: false
- text: Something went wrong This screen ran into a problem. Try again. If this keeps happening, close Cherry Studio completely and reopen it. Retry Cherry Studio
```

## startup stages
- none logged

## console tail (48 messages)
- [error] Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- [error] Failed to load resource: net::ERR_FAILED
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [error] TypeError: o.get is not a function
- [log] [stack-frame] TypeError: o.get is not a function
- [log] [stack-frame] at f (http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:5412:287)
- [log] [stack-frame] at e.initialUpdaterRun (http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:1396:327)
- [log] [stack-frame] at e.useAnimatedStyle (http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:1452:453)
- [log] [stack-frame] at _e.ChatComposerClearance (http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:3823:459)
- [log] [stack-frame] at _o (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:57061)
- [log] [stack-frame] at hu (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:80466)
- [log] [stack-frame] at Iu (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:91388)
- [log] [stack-frame] at Pf (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:136688)
- [log] [stack-frame] at Tf (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:135696)
- [log] [stack-frame] at Nf (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:135538)
- [error] Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- [error] Failed to load resource: net::ERR_FAILED
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 2 database(s), 9 file(s)
- [warn] Deprecated: prop 'getId' on screen files/[fileEntryId] is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [error] Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- [error] Failed to load resource: net::ERR_FAILED
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [error] TypeError: (0 , r(...).codegenNativeComponent) is not a function
- [log] [stack-frame] TypeError: (0 , r(...).codegenNativeComponent) is not a function
- [log] [stack-frame] at http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:2261:207
- [log] [stack-frame] at f (http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js:4:2010)
- [log] [stack-frame] at a (http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js:4:1512)
- [log] [stack-frame] at i (http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js:4:586)
- [log] [stack-frame] at http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:2259:370
- [log] [stack-frame] at f (http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js:4:2010)
- [log] [stack-frame] at a (http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js:4:1512)
- [log] [stack-frame] at i (http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js:4:586)
- [log] [stack-frame] at o (http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js:2264:252)
- [log] [stack-frame] at _o (http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js:315:57061)

## page errors (0)

## console errors (8)
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- TypeError: o.get is not a function
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- Access to fetch at 'https://analytics.cherry-ai.com/api/track' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Request header field app-name is not allowed by Access-Control-Allow-Headers in preflight response.
- Failed to load resource: net::ERR_FAILED
- TypeError: (0 , r(...).codegenNativeComponent) is not a function

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (3)
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED
- POST https://analytics.cherry-ai.com/api/track :: net::ERR_FAILED

## workers (0)
- none

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-8bbb6b0f921baabe7442517fba32df3c.js
- http://127.0.0.1:8099/_expo/static/js/web/index-a3ce0e6b0556238491560dedc2e7cfb4.js
- http://127.0.0.1:8099/sqlite3/sqlite3.wasm
- http://127.0.0.1:8099/_expo/static/js/web/_layout-aab386dd34d12ff606522fc811eff1e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-53501e52582fd2edbc769c33d0d405e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-ce65163132c001c93990acf79cd18f44.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
- http://127.0.0.1:8099/_expo/static/js/web/index-43a609c9e85702b33c3c35ac0a3a9a53.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-96f4b2821f567ae5339167974df76759.js
- http://127.0.0.1:8099/_expo/static/js/web/index-f9384db76673e101b7654ff4595eb18b.js
