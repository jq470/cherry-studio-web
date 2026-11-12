#!/usr/bin/env node
/**
 * react-native-web omits `codegenNativeComponent`, but native packages ship
 * fabric specs that do `import { codegenNativeComponent } from 'react-native'`
 * (react-native-svg's fabric/*NativeComponent.js among others). On web that
 * import resolves to react-native-web, the call throws at module init and the
 * screen is lost.
 *
 * Metro module remapping of `react-native` did not reach those specs, so add the
 * missing export to the installed package instead. Idempotent.
 */
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');

let entry = null;
try {
  entry = require.resolve('react-native-web/dist/index.js', { paths: [path.join(root, 'upstream')] });
} catch (error) {
  console.error('[rnw] react-native-web not installed yet:', error.message);
  process.exit(0);
}

const marker = '// cherry-studio-web: codegenNativeComponent shim';
const source = fs.readFileSync(entry, 'utf8');
if (source.includes(marker)) {
  console.log('[rnw] already patched');
  process.exit(0);
}

const shim = `
${marker}
export function codegenNativeComponent(name) {
  function NativeComponent() {
    return null;
  }
  NativeComponent.displayName = String(name || 'NativeComponent');
  return NativeComponent;
}
`;

fs.writeFileSync(entry, `${source.trimEnd()}\n${shim}`);
console.log(`[rnw] added codegenNativeComponent to ${entry}`);
