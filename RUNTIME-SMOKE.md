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
