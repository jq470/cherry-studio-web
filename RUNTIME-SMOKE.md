# Runtime smoke report

- url: http://127.0.0.1:8099/
- boot wait: 3764 ms (first non-empty paint: 3764)
- dom nodes: 93
- title: Cherry Studio
- verdict: PASS (no startup failure markers)
- #root children: 1 | body text length: 310
- sqlite backend: ready
- crossOriginIsolated: true | SAB: true | Worker: true
- hardwareConcurrency: 4

## body excerpt
```
Welcome to Cherry Connect your AI service or sync your existing setup from your computer. Connect a provider Sync from desktop Set up later Privacy and data Cherry Studio collects a small amount of anonymous data to understand how its features are used. Read the full privacy policy Accept and continue Decline
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
<div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-105ug2t"><div class="css-g5y9jx r-13awgt0"><div style="position: absolute; inset: 0px; pointer-events: none; visibility: hidden;"></div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af" style="background-color: rgb(245, 245, 245); display: flex;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0"><div style="position: absolute; inset: 0px; pointer-events: none; visibility: hidden;"></div><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0 r-1p0dtai r-1d2f490 r-u8s1d r-zchlnj r-ipm5af" style="background-color: rgb(245, 245, 245); display: flex;"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx r-13awgt0"><div class="css-g5y9jx flex-1" style="padding-left: 0px; padding-right: 0px;"><div class="css-g5y9jx w-full flex-1 self-center" style="max-width: 720px;"><div class="css-g5y9jx flex-1 bg-background" data-testid="onboarding-welcome" style="padding-top: 0px; padding-bottom: 0px;"><div class="css-g5y9jx r-150rngu r-eqz5dr r-16y2uox r-1wbh5a2 r-11yh6sk r-1rnoaur r-agouwx r-2eszeu"><div class="css-g5y9jx flex-grow justify-between gap-8 pb-4"><div class="css-g5y9jx flex-grow items-center justify-center gap-8 px-8 py-12"><div class="css-g5y9jx" style="height: 104px; width: 100.484px;"><div class="css-g5y9jx" style="left: -17.5846px; position: absolute; top: -18.2px; transform: translateY(-100px) scale(1);"></div></div><div class="css-g5y9jx items-center gap-3"><div class="css-g5y9jx" style="opacity: 0; transform: translateY(16px);"><h1 dir="auto" role="heading" class="css-146c3p1 text-center font-semibold text-3xl text-foreground">Welcome to Cherry</h1></div><div class="css-g5y9jx" style="opacity: 0; transform: translateY(16px);"><div dir="auto" class="css-146c3p1 text-ce
```

## startup stages
- none logged

## console tail (10 messages)
- [log] [web-gate] sqlite ready
- [log] [web-gate] preloaded 0 database(s), 0 file(s)
- [warn] sqlite3_step() rc= 20 SQLITE_MISMATCH SQL = SELECT rowid, data, searchable_text AS searchableText FROM agent_session_message WHERE rowid > ? AND status NOT IN ('pending', 'streaming') AND (instr(searchable_text, ?) > 0 OR instr(searc…
- [warn] Deprecated: prop 'getId' on screen files/[fileEntryId] is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] Deprecated: prop 'getId' on screen paintings/index is deprecated. Please rename the prop to 'dangerouslySingular'
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [warn] [Reanimated] Selected easing is not currently supported on web. Using linear easing instead.
- [error] Access to fetch at 'https://raw.githubusercontent.com/CherryHQ/cherry-studio/refs/heads/x-files/provider-registry/v4/manifest.json' from origin 'http://127.0.0.1:8099' has been blocked by CORS policy: Response to preflight request d…
- [error] Failed to load resource: net::ERR_FAILED

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
- http://127.0.0.1:8099/_expo/static/js/web/index-54fc41b3c6d031030ad1394a722f3754.js

## unknown module analysis (0)
- no mapping recovered
