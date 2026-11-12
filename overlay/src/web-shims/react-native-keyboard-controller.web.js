// react-native-keyboard-controller on web.
//
// 25 call sites: the provider must render, the hooks must return values that
// callers can read (`height.value`, `isVisible`, `input.value`), and the
// controller is a no-op (there is no soft keyboard in a browser).
//
// Reanimated 4 removed `.value` in favour of `.get()`; returning a plain
// `{ value: 0 }` makes `height.get()` throw inside useAnimatedStyle, so the
// hooks hand out real shared values when reanimated is available.
'use strict';

const React = require('react');

const { createStub } = require('./native-stub');

const wrap = (tag) =>
  function KeyboardWrapper(props) {
    return React.createElement(tag, { style: props && props.style }, props && props.children);
  };

function createSharedValue(initial) {
  try {
    const reanimated = require('react-native-reanimated');
    const makeMutable = reanimated.makeMutable || (reanimated.default && reanimated.default.makeMutable);
    if (typeof makeMutable === 'function') return makeMutable(initial);
  } catch (error) {
    /* fall back to a value object below */
  }
  return {
    value: initial,
    get: () => initial,
    set: () => {},
    addListener: () => {},
    removeListener: () => {},
    modify: () => {},
  };
}

const height = createSharedValue(0);
const progress = createSharedValue(0);
const input = createSharedValue(null);

const useKeyboardState = () => ({ height: 0, isVisible: false, duration: 0, easing: 'easeOut' });
const useReanimatedKeyboardAnimation = () => ({ height, progress });
const useReanimatedFocusedInput = () => ({ input });
const useKeyboardHandler = () => undefined;
const useGenericKeyboardHandler = () => undefined;
const useFocusedInputHandler = () => undefined;

const KeyboardController = {
  setInputMode: () => {},
  setDefaultMode: () => {},
  setEnabled: () => {},
  dismiss: () => {},
  isVisible: () => false,
  preload: () => {},
  addListener: () => ({ remove: () => {} }),
};

const KeyboardEvents = {
  addListener: () => ({ remove: () => {} }),
};

const exports_ = {
  KeyboardProvider: wrap('div'),
  KeyboardAwareScrollView: wrap('div'),
  KeyboardStickyView: wrap('div'),
  KeyboardAvoidingView: wrap('div'),
  OverKeyboardView: wrap('div'),
  KeyboardToolbar: wrap('div'),
  KeyboardToolbarTheme: { light: 'light', dark: 'dark' },
  KeyboardController,
  KeyboardEvents,
  useKeyboardState,
  useReanimatedKeyboardAnimation,
  useReanimatedFocusedInput,
  useKeyboardHandler,
  useGenericKeyboardHandler,
  useFocusedInputHandler,
};

// Unknown exports (the package surface is large and version-dependent) fall back
// to a component that renders nothing.
const shim = createStub('react-native-keyboard-controller', exports_);

module.exports = shim;
module.exports.default = shim;
