#!/usr/bin/env bash
# Copy the overlay into the freshly cloned upstream tree and apply the patches.
# Idempotent end to end: shim copy is a plain overwrite, patches detect their own marker.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPSTREAM="$ROOT/upstream"

[ -d "$UPSTREAM" ] || { echo "::error::upstream/ missing; run prepare-upstream.sh first"; exit 1; }

mkdir -p "$UPSTREAM/src/web-shims"
cp "$ROOT/overlay/src/web-shims/"*.js "$UPSTREAM/src/web-shims/"
cp -r "$ROOT/overlay/web" "$UPSTREAM/web-adaptation"
cp "$ROOT/overlay/docs/WEB-ADAPTATION.md" "$UPSTREAM/WEB-ADAPTATION.md"

node "$ROOT/scripts/patch-app-config.js" "$UPSTREAM/app.json"
node "$ROOT/scripts/patch-metro.js" "$UPSTREAM/metro.config.js"
node "$ROOT/scripts/patch-rnw.js"

echo "shims: $(ls -1 "$UPSTREAM/src/web-shims" | wc -l) files"
node -e "
const a=require('$UPSTREAM/app.json');
console.log('app.json web:', JSON.stringify(a.expo.web));
"
