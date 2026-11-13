# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 47314 ms (first non-empty paint: never)
- dom nodes: 18
- title: Cherry Studio
- verdict: FAIL: #root has no children | FAIL: body text too short | FAIL: 2 uncaught page error(s)
- #root children: 0 | body text length: 0
- sqlite backend: ready
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
(empty)
```

## react fiber tree
```
HostRoot
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
- sqlite: ready
- elapsed: 22036 ms
- welcome screen returned: false
- text: (empty)
```

## startup stages
- none logged

## console tail (4 messages)
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 0 database(s), 0 file(s)
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 0 database(s), 5 file(s)

## page errors (2)
- Minified React error #130; visit https://react.dev/errors/130?args[]=undefined&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.
- Minified React error #130; visit https://react.dev/errors/130?args[]=undefined&args[]= for the full message or use the non-minified dev environment for full errors and additional helpful warnings.

## console errors (0)

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (0)

## workers (0)
- none

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-4785bb1796e41dffd36aca90067db179.js
- http://127.0.0.1:8099/_expo/static/js/web/index-8012037c038c1d96498445972bcc42f0.js
- http://127.0.0.1:8099/sqlite3/sqlite3.wasm
- http://127.0.0.1:8099/_expo/static/js/web/_layout-aab386dd34d12ff606522fc811eff1e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-53501e52582fd2edbc769c33d0d405e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-ce65163132c001c93990acf79cd18f44.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
