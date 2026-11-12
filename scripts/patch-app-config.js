#!/usr/bin/env node
/**
 * Anchor patch for upstream app.json.
 *
 * Only touches `expo.web`; every other key (icons, scheme, plugins, updates) is
 * preserved verbatim so we never fork the app config. Idempotent: re-running on
 * an already patched file is a no-op.
 *
 * `output: single` is mandatory: `static` makes `expo export` Node-prerender the
 * app, and the upstream code touches window/document/localStorage at module
 * scope, which crashes the export before a bundle is ever written.
 */
const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || 'upstream/app.json');
const raw = fs.readFileSync(target, 'utf8');
const json = JSON.parse(raw);

if (!json.expo || typeof json.expo !== 'object') {
  console.error(`::error::${target} has no "expo" object`);
  process.exit(1);
}

const current = json.expo.web && typeof json.expo.web === 'object' ? json.expo.web : {};
const wanted = { ...current, bundler: 'metro', output: 'single' };

const changed = Object.entries(wanted).some(([k, v]) => current[k] !== v);
if (!changed) {
  console.log('app.json web config already patched, skipping');
  process.exit(0);
}

json.expo.web = wanted;
fs.writeFileSync(target, `${JSON.stringify(json, null, 2)}\n`);
console.log(`patched ${target}: expo.web = ${JSON.stringify(wanted)}`);
