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
