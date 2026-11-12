#!/usr/bin/env node
/**
 * Patch upstream/metro.config.js so a web export resolves browser shims.
 *
 * Three layers are injected:
 *   L1  react-native/Libraries/** and react-native/src/** -> native-stub.js
 *       (the native RN core drags TurboModuleRegistry onto the web bundle)
 *   L2  behavioural shims for the modules the app actually calls
 *   L2b subpaths of those packages (pkg/sub/path) -> the same shim, so a stubbed
 *       native package cannot leak its real implementation through an internal
 *       import (e.g. @shopify/react-native-skia/lib/...)
 *
 * Idempotent: a second run detects the marker and exits 0.
 */
'use strict';

const fs = require('fs');

const target = process.argv[2] || 'upstream/metro.config.js';
const src = fs.readFileSync(target, 'utf8');

if (src.includes('web-shims')) {
  console.log(`[metro] ${target} already patched, skipping`);
  process.exit(0);
}

const ANCHOR = 'config.resolver.resolveRequest = (context, moduleName, platform) => {';
if (!src.includes(ANCHOR)) {
  console.error(`::error::anchor not found in ${target}; upstream metro.config.js changed`);
  process.exit(1);
}

// Module -> shim. Default target is the generic stub; behavioural shims get their own file.
const SHIMS = {
  // --- behavioural (L2): the app actually consumes these return values ---
  'expo-sqlite': 'expo-sqlite.web.js',
  'expo-file-system': 'expo-file-system.web.js',
  'expo-file-system/legacy': 'expo-file-system.web.js',
  'expo-file-system/next': 'expo-file-system.web.js',
  'react-native-mmkv': 'react-native-mmkv.web.js',
  'react-native-keyboard-controller': 'react-native-keyboard-controller.web.js',
  '@sentry/react-native': 'sentry-react-native.web.js',
  'expo-image-picker': 'expo-image-picker.web.js',
  'react-native-webview': 'react-native-webview.web.js',

  // --- generic stub (L1): native-only, never exercised on the web path,
  //     but Metro still bundles the static require edge ---
  'react-native-quick-crypto': 'native-stub.js',
  'expo-camera': 'native-stub.js',
  'expo-media-library': 'native-stub.js',
  'expo-notifications': 'native-stub.js',
  'expo-widgets': 'native-stub.js',
  'expo-glass-effect': 'native-stub.js',
  'expo-observe': 'native-stub.js',
  'expo-calendar': 'native-stub.js',
  'expo-calendar/legacy': 'native-stub.js',
  'expo-speech': 'native-stub.js',
  'expo-speech-recognition': 'native-stub.js',
  'expo-audio': 'native-stub.js',
  'expo-paste-input': 'native-stub.js',
  'expo-intent-launcher': 'native-stub.js',
  'react-native-nitro-theme-transition': 'native-stub.js',
  'react-native-reserved-regions': 'native-stub.js',
  'react-native-share': 'native-stub.js',
  'react-native-view-shot': 'native-stub.js',
  'react-native-background-actions': 'native-stub.js',
  'react-native-anydoc': 'native-stub.js',
  'react-native-enriched-markdown': 'native-stub.js',
  '@magrinj/expo-quick-look': 'native-stub.js',
  '@preeternal/react-native-file-hash': 'native-stub.js',
  '@siteed/sherpa-onnx.rn': 'native-stub.js',
  '@shopify/react-native-skia': 'native-stub.js',
};

const mapLiteral = Object.entries(SHIMS)
  .map(([mod, file]) => `      ${JSON.stringify(mod)}: ${JSON.stringify(file)},`)
  .join('\n');

const injection = `// Upstream ships a wasm import inside its optional native paths; without this
// Metro aborts the whole web bundle with "Unable to resolve ... .wasm".
config.resolver.assetExts.push('wasm');

// Browser replacements for native modules live in src/web-shims.
const webShimMap = {
${mapLiteral}
};
${ANCHOR}
  if (platform === 'web') {
    // Any react-native/Libraries/** or react-native/src/** subpath drags the
    // native RN core (NativeUIManager -> TurboModuleRegistry -> __fbBatchedBridgeConfig)
    // onto the web bundle. react-native-web has no such internal paths.
    if (
      moduleName.startsWith('react-native/Libraries/') ||
      moduleName.startsWith('react-native/src/')
    ) {
      return {
        type: 'sourceFile',
        filePath: path.join(__dirname, 'src/web-shims', 'native-stub.js'),
      };
    }
    // react-native-web 0.21.4 exposes InputAccessoryView as a directory entry that
    // Metro cannot resolve under pnpm: "Unable to resolve ./exports/InputAccessoryView".
    if (
      moduleName === './exports/InputAccessoryView' &&
      context.originModulePath.includes('react-native-web')
    ) {
      return {
        type: 'sourceFile',
        filePath: path.join(__dirname, 'src/web-shims', 'rnw-input-accessory-view.web.js'),
      };
    }
    // Exact matches first, then the longest matching package prefix: a stubbed
    // package's internal subpaths (e.g. @shopify/react-native-skia/lib/...) must
    // resolve to the shim too, or they drag the real native implementation in.
    let shimKey = webShimMap[moduleName] ? moduleName : null;
    if (!shimKey) {
      for (const key of Object.keys(webShimMap)) {
        if (moduleName.startsWith(key + '/') && (!shimKey || key.length > shimKey.length)) {
          shimKey = key;
        }
      }
    }
    if (shimKey) {
      return {
        type: 'sourceFile',
        filePath: path.join(__dirname, 'src/web-shims', webShimMap[shimKey]),
      };
    }
  }
`;

src = src.replace(ANCHOR, injection);
fs.writeFileSync(target, src);
console.log(`patched ${target} with ${Object.keys(SHIMS).length} web shims`);
