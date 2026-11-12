# Web build report

- run: 43261066283 (299691da6cfaeb391e1721d5e962af0e55b830f9)
- upstream: 714d071096589a4144e2c4dbbbf2b6e3827b998c
- diagnostic export: 
- stage: smoke
- size: 2 MB
- files: 2

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

Done in 52.6s using pnpm v12.2.1
```

## overlay log (tail)
```
patched /home/runner/work/cherry-studio-web/cherry-studio-web/upstream/app.json: expo.web = {"output":"single","favicon":"./assets/icon.png","bundler":"metro"}
/home/runner/work/cherry-studio-web/cherry-studio-web/scripts/patch-metro.js:123
src = src.replace(ANCHOR, injection);
    ^

TypeError: Assignment to constant variable.
    at Object.<anonymous> (/home/runner/work/cherry-studio-web/cherry-studio-web/scripts/patch-metro.js:123:5)
    at Module._compile (node:internal/modules/cjs/loader:1929:14)
    at Object..js (node:internal/modules/cjs/loader:2060:10)
    at Module.load (node:internal/modules/cjs/loader:1651:32)
    at Module._load (node:internal/modules/cjs/loader:1443:12)
    at wrapModuleLoad (node:internal/modules/cjs/loader:261:19)
    at Module.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:154:5)
    at node:internal/main/run_main_module:33:47

Node.js v24.22.2
```

## export log (tail)
```

 index.ts
 | import "expo-router/entry"

 
 | import "./index.ts"


Error: Unable to resolve module ./exports/InputAccessoryView from /home/runner/work/cherry-studio-web/cherry-studio-web/upstream/node_modules/.pnpm/react-native-web@0.21.4_encoding@0.1.13_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/react-native-web/dist/index.js: ./exports/InputAccessoryView could not be found within the project or in these directories:
  node_modules/.pnpm/react-native-web@0.21.4_encoding@0.1.13_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules
  node_modules/.pnpm/node_modules
  node_modules
[0m [90m 39 |[39m [36mexport[39m { [36mdefault[39m [36mas[39m [33mImage[39m } [36mfrom[39m [32m'./exports/Image'[39m[33m;[39m
 [90m 40 |[39m [36mexport[39m { [36mdefault[39m [36mas[39m [33mImageBackground[39m } [36mfrom[39m [32m'./exports/ImageBackground'[39m[33m;[39m
[31m[1m>[22m[39m[90m 41 |[39m [36mexport[39m { [36mdefault[39m [36mas[39m [33mInputAccessoryView[39m } [36mfrom[39m [32m'./exports/InputAccessoryView'[39m[33m;[39m
 [90m    |[39m                                                [31m[1m^[22m[39m
 [90m 42 |[39m [36mexport[39m { [36mdefault[39m [36mas[39m [33mKeyboardAvoidingView[39m } [36mfrom[39m [32m'./exports/KeyboardAvoidingView'[39m[33m;[39m
 [90m 43 |[39m [36mexport[39m { [36mdefault[39m [36mas[39m [33mModal[39m } [36mfrom[39m [32m'./exports/Modal'[39m[33m;[39m
 [90m 44 |[39m [36mexport[39m { [36mdefault[39m [36mas[39m [33mPicker[39m } [36mfrom[39m [32m'./exports/Picker'[39m[33m;[39m[0m

Import stack:

 node_modules/.pnpm/react-native-web@0.21.4_encoding@0.1.13_react-dom@19.3.0_react@19.3.0__react@19.3.0/node_modules/react-native-web/dist/index.js
 | import "./exports/InputAccessoryView"

 node_modules/.pnpm/expo-router@58.0.29_patch_hash=231e96fb0587925929e716eb079a37f4cd6f0bc8a9dad0bbb62cfece_ec17e538f314aca3a86b20b563c087eb/node_modules/expo-router/build/renderRootComponent.js
 | import "react-native-web/dist/index"

 node_modules/.pnpm/expo-router@58.0.29_patch_hash=231e96fb0587925929e716eb079a37f4cd6f0bc8a9dad0bbb62cfece_ec17e538f314aca3a86b20b563c087eb/node_modules/expo-router/entry-classic.js
 | import "expo-router/build/renderRootComponent"

 node_modules/.pnpm/expo-router@58.0.29_patch_hash=231e96fb0587925929e716eb079a37f4cd6f0bc8a9dad0bbb62cfece_ec17e538f314aca3a86b20b563c087eb/node_modules/expo-router/entry.js
 | import "expo-router/entry-classic"

 index.ts
 | import "expo-router/entry"

 
 | import "./index.ts"

```

## gate log (tail)
```
[gate] upstream/dist-web/index.html not found
```

## smoke log (tail)
```
onboarding dismissed: false
```

## reload (persistence)
```
- sqlite: unset
- elapsed: 22059 ms
- welcome screen returned: false
- text: not found
```

## startup stages
- none logged

## console tail (3 messages)
- [error] Failed to load resource: the server responded with a status of 404 (Not Found)
- [error] Failed to load resource: the server responded with a status of 404 (Not Found)
- [error] Failed to load resource: the server responded with a status of 404 (Not Found)

## page errors (0)

## console errors (3)
- Failed to load resource: the server responded with a status of 404 (Not Found)
- Failed to load resource: the server responded with a status of 404 (Not Found)
- Failed to load resource: the server responded with a status of 404 (Not Found)

## unknown module analysis (0)
- no mapping recovered

## bad responses (3)
- 404 http://127.0.0.1:8099/
- 404 http://127.0.0.1:8099/favicon.ico
- 404 http://127.0.0.1:8099/

## failed requests (0)

## workers (0)
- none

## scripts
```

## sqlite3 runtime
total 1512
drwxr-xr-x 2 runner runner   4096 Nov 12 16:43 .
drwxr-xr-x 3 runner runner   4096 Nov 12 16:43 ..
-rw-r--r-- 1 runner runner 656872 Nov 12 16:43 index.mjs
-rw-r--r-- 1 runner runner 879084 Nov 12 16:43 sqlite3.wasm

## js chunks

## wasm assets
./sqlite3/sqlite3.wasm

## runtime smoke
# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 46233 ms (first non-empty paint: 1159)
- dom nodes: 5
- title: 
- verdict: FAIL: #root has no children | FAIL: body text too short | FAIL: sqlite backend state = unset
- #root children: -1 | body text length: 9
- sqlite backend: unset
- crossOriginIsolated: false | SAB: false | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
not found
```

## react fiber tree
```
no #root
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
- elapsed: 22059 ms
- welcome screen returned: false
- text: not found
```

## startup stages
- none logged

## console tail (3 messages)
- [error] Failed to load resource: the server responded with a status of 404 (Not Found)
- [error] Failed to load resource: the server responded with a status of 404 (Not Found)
- [error] Failed to load resource: the server responded with a status of 404 (Not Found)

## page errors (0)

## console errors (3)
- Failed to load resource: the server responded with a status of 404 (Not Found)
- Failed to load resource: the server responded with a status of 404 (Not Found)
- Failed to load resource: the server responded with a status of 404 (Not Found)

## unknown module analysis (0)
- no mapping recovered

## bad responses (3)
- 404 http://127.0.0.1:8099/
- 404 http://127.0.0.1:8099/favicon.ico
- 404 http://127.0.0.1:8099/

## failed requests (0)

## workers (0)
- none

## scripts
