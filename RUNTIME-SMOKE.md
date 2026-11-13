# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 2668 ms (first non-empty paint: 2668)
- dom nodes: 339
- title: Cherry Studio
- verdict: PASS (no startup failure markers)
- #root children: 1 | body text length: 244
- sqlite backend: ready
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel 🍒 What should we create together today? Camera Photos File Plugins Skills Select model AI-generated content, for reference only 🍒 Cherie
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
<div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div style="display: flex; flex-direction: column; flex: 1 1 0%; min-height: 0px; width: 100%; height: 100%;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-105ug2t"><div class="css-g5y9jx r-13awgt0"><div style="position: absolute; inset: 0px; pointer-events: none; visibility: hidden;"></div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af" style="background-color: rgb(245, 245, 245); display: flex;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0"><div style="position: absolute; inset: 0px; pointer-events: none; visibility: hidden;"></div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-18u37iz"><div class="css-g5y9jx r-1p0dtai r-dnmrzs r-ipm5af" style="position: relative; z-index: 1; border-right-color: rgba(0, 0, 0, 0.21); border-right-width: 1px; background-color: rgb(245, 245, 245); width: 280px;"><div class="css-g5y9jx flex-1" data-testid="sidebar" style="margin-right: 0px;"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx r-150rngu r-eqz5dr r-16y2uox r-1wbh5a2 r-11yh6sk r-1rnoaur r-agouwx r-2eszeu"><div class="css-g5y9jx" style="padding-bottom: 92px; padding-left: 0px; padding-top: 56px;"><div class="css-g5y9jx" style="opacity: 1;"><button role="button" class="css-g5y9jx" data-testid="sidebar-agents" type="button" style="cursor: pointer; user-select: none; touch-action: auto;"><div class="css-g5y9jx mx-2 flex-row items-center gap-4 rounded-xl px-3 py-2.5"><svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#171717" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path fill="none" stroke="#171717" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" height="18" width="18" d="M14 4.1 12 6"></pat
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
- elapsed: 1560 ms
- welcome screen returned: false
- text: Agents Drawings Plugins Skills Files Sessions No sessions yet Cherry Studio Cherry Studio New chat Cancel 🍒 What should we create together today? Camera Photos File Plugins Skills Select model AI-generated content, for reference only 🍒 Ch
```

## startup stages
- none logged

## console tail (17 messages)
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
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 2 database(s), 9 file(s)
- [warn] Deprecated: prop 'getId' on screen files/[fileEntryId] is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.

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
- http://127.0.0.1:8099/_expo/static/js/web/__common-b9473b5c37e394632d7d77502404d54d.js
- http://127.0.0.1:8099/_expo/static/js/web/index-8012037c038c1d96498445972bcc42f0.js
- http://127.0.0.1:8099/sqlite3/sqlite3.wasm
- http://127.0.0.1:8099/_expo/static/js/web/_layout-aab386dd34d12ff606522fc811eff1e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-53501e52582fd2edbc769c33d0d405e8.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-ce65163132c001c93990acf79cd18f44.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-7c1581799993158806dec9da7b066143.js
- http://127.0.0.1:8099/_expo/static/js/web/index-43a609c9e85702b33c3c35ac0a3a9a53.js
- http://127.0.0.1:8099/_expo/static/js/web/_layout-96f4b2821f567ae5339167974df76759.js
- http://127.0.0.1:8099/_expo/static/js/web/index-f9384db76673e101b7654ff4595eb18b.js
