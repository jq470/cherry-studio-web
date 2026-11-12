// `react-native` on web, with the few exports react-native-web omits.
//
// Fabric specs shipped inside native packages (react-native-svg's
// fabric/*NativeComponent.js, some reanimated/safe-area specs) do:
//
//   import { codegenNativeComponent } from 'react-native';
//
// react-native-web has no such export, so the module throws at import time and
// takes the whole screen down. Everything else is passed through untouched.
'use strict';

const ReactNativeWeb = require('react-native-web');

const shim = {};
for (const key of Object.keys(ReactNativeWeb)) shim[key] = ReactNativeWeb[key];

if (typeof shim.codegenNativeComponent !== 'function') {
  shim.codegenNativeComponent = function codegenNativeComponent(name) {
    function NativeComponent() {
      return null;
    }
    NativeComponent.displayName = String(name || 'NativeComponent');
    return NativeComponent;
  };
}

// A couple of specs also read NativeModules at import time; a harmless empty
// object is enough for web.
if (!shim.NativeModules) shim.NativeModules = {};

module.exports = shim;
module.exports.default = shim.default || shim;
