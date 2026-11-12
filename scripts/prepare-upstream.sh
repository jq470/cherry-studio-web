#!/usr/bin/env bash
# Fetch the upstream app at a pinned commit. Shallow, single-branch, single-commit:
# ~25s instead of cloning full history.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
UPSTREAM_SHA="${UPSTREAM_SHA:-714d071096589a4144e2c4dbbbf2b6e3827b998c}"
UPSTREAM_REPO="${UPSTREAM_REPO:-https://github.com/CherryHQ/cherry-studio-app.git}"

cd "$ROOT"
rm -rf upstream
mkdir -p upstream
cd upstream
git init -q
git remote add origin "$UPSTREAM_REPO"
git fetch -q --depth 1 origin "$UPSTREAM_SHA"
git checkout -q FETCH_HEAD

echo "upstream commit: $(git rev-parse HEAD)"
node -e "const p=require('./package.json'); console.log('upstream app:', p.version, '| expo', p.dependencies.expo, '| rn', p.dependencies['react-native'])"
