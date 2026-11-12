# Web build report

- run: 43325249062 (909df2ae7ebe868eb20837d765ef366a306de84d)
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

Done in 48.1s using pnpm v12.2.1
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
```

## interaction
```
privacy accept clicked: false
privacy button not found; continuing anyway
skip setup clicked: false
onboarding dismissed: false
```

## reload (persistence)
```
- sqlite: unset
- elapsed: 22063 ms
- welcome screen returned: false
- text: (empty)
```

## startup stages
- none logged

## console tail (0 messages)

## page errors (2)
- Invalid or unexpected token
- Invalid or unexpected token

## console errors (0)

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (0)

## workers (0)
- none

## scripts
```

## sqlite3 runtime
total 1512
drwxr-xr-x 2 runner runner   4096 Nov 12 23:04 .
drwxr-xr-x 5 runner runner   4096 Nov 12 23:04 ..
-rw-r--r-- 1 runner runner 656872 Nov 12 23:04 index.mjs
-rw-r--r-- 1 runner runner 879084 Nov 12 23:04 sqlite3.wasm

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
- boot wait: 47399 ms (first non-empty paint: never)
- dom nodes: 14
- title: Cherry Studio
- verdict: FAIL: #root has no children | FAIL: body text too short | FAIL: sqlite backend state = unset | FAIL: 2 uncaught page error(s)
- #root children: 0 | body text length: 0
- sqlite backend: unset
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
(empty)
```

## react fiber tree
```
no container fiber key: 
```

## #root html
```html
(empty)
```

## interaction
```
privacy accept clicked: false
privacy button not found; continuing anyway
skip setup clicked: false
onboarding dismissed: false
```

## reload (persistence)
```
- sqlite: unset
- elapsed: 22063 ms
- welcome screen returned: false
- text: (empty)
```

## startup stages
- none logged

## console tail (0 messages)

## page errors (2)
- Invalid or unexpected token
- Invalid or unexpected token

## console errors (0)

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (0)

## workers (0)
- none

## scripts
