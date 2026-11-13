# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 3570 ms (first non-empty paint: 3570)
- dom nodes: 38
- title: Cherry Studio
- verdict: FAIL: startup failure markers → couldn't start | FAIL: sqlite backend state = failed:sqlite runtime is provided by the index.html boot gate (scripts/patch-index-html.js)
- #root children: 1 | body text length: 157
- sqlite backend: failed:sqlite runtime is provided by the index.html boot gate (scripts/patch-index-html.js)
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
Cherry Studio couldn't start Something stopped the app from starting. Try again. If this keeps happening, close Cherry Studio completely and reopen it. Retry
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
<div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div style="display: flex; flex-direction: column; flex: 1 1 0%; min-height: 0px; width: 100%; height: 100%;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-105ug2t"><div aria-live="polite" class="css-g5y9jx flex-1 items-center justify-center bg-background px-8"><div class="css-g5y9jx items-center justify-center gap-4"><div class="css-g5y9jx max-w-full gap-1.5 items-center"><div dir="auto" class="css-146c3p1 text-center font-semibold text-lg text-error r-1xnzce8">Cherry Studio couldn't start</div><div dir="auto" class="css-146c3p1 text-center text-muted-foreground text-sm r-1xnzce8">Something stopped the app from starting. Try again. If this keeps happening, close Cherry Studio completely and reopen it.</div></div><div class="css-g5y9jx flex-row flex-wrap items-center gap-3 justify-center"><button role="button" tabindex="0" class="css-g5y9jx r-1loqt21 r-1otgn73 flex-row items-center justify-center overflow-hidden border-0 active:opacity-80 disabled:opacity-40 bg-foreground shadow-xs rounded-full gap-2 px-4 py-2.5" type="button"><div dir="auto" class="css-146c3p1 min-w-0 shrink text-center font-medium text-base text-background">Retry</div></button></div></div></div></div></div></div></div></div></div></div>
```

## interaction
```
privacy accept clicked: false
privacy button not found; continuing anyway
skip setup clicked: false
onboarding dismissed: true
```

## reload (persistence)
```
- sqlite: failed:sqlite runtime is provided by the index.html boot gate (scripts/patch-index-html.js)
- elapsed: 2432 ms
- welcome screen returned: false
- text: Cherry Studio couldn't start Something stopped the app from starting. Try again. If this keeps happening, close Cherry Studio completely and reopen it. Retry Cherry Studio
```

## startup stages
- none logged

## console tail (0 messages)

## page errors (0)

## console errors (0)

## unknown module analysis (0)
- no mapping recovered

## bad responses (0)

## failed requests (0)

## workers (0)
- none

## scripts
- http://127.0.0.1:8099/_expo/static/js/web/__expo-metro-runtime-d69eda5965c49045122640c27878a05e.js
- http://127.0.0.1:8099/_expo/static/js/web/__common-074ad4f4a6a28c73e9f858a1ad4f6235.js
- http://127.0.0.1:8099/_expo/static/js/web/index-8012037c038c1d96498445972bcc42f0.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-aab386dd34d12ff606522fc811eff1e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-53501e52582fd2edbc769c33d0d405e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-ce65163132c001c93990acf79cd18f44.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
