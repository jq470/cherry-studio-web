#!/usr/bin/env node
/**
 * Anchor patch for upstream metro.config.js.
 *
 * Anchored on `config.resolver.resolveRequest = (context, moduleName, platform) => {`
 * so upstream's own resolver logic (libp2p browser maps, MCP shims, Expo runtime
 * pinning) stays byte-for-byte intact. Idempotent: a second run is a no-op.
 *
 * Rules, all scoped to platform === 'web':
 *   1. react-native/Libraries/** and react-native/src/**  -> generic stub
 *      (these pull the native RN core and throw __fbBatchedBridgeConfig on web)
 *   2. react-native-web's "./exports/InputAccessoryView" -> local component stub
 *      (pnpm layout makes Metro fail to resolve that directory entry)
 *   3. explicit module -> shim file table (L1 generic stub, L2 behavioural shim)
 */
const fs = require('fs');
const path = require('path');

const target = path.resolve(process.argv[2] || 'upstream/metro.config.js');
const MARKER = 'src/web-shims';
let src = fs.readFileSync(target, 'utf8');

if (src.includes(MARKER)) {
  console.log('metro.config.js already patched, skipping');
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
    const shimFile = webShimMap[moduleName];
    if (shimFile) {
      return {
        type: 'sourceFile',
        filePath: path.join(__dirname, 'src/web-shims', shimFile),
      };
    }
  }
`;

src = src.replace(ANCHOR, injection);
fs.writeFileSync(target, src);
console.log(`patched ${target} with ${Object.keys(SHIMS).length} web shims`);
