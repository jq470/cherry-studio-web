// react-native-keyboard-controller on web.
//
// 25 call sites: the provider must render, the hooks must return values that
// callers can read (`height.value`, `isVisible`, `input.value`), and the
// controller is a no-op (there is no soft keyboard in a browser).
//
// KeyboardProvider wraps the whole app. Rendering it as a bare <div> gave the
// root layout a 0-height box: absolutely positioned children then resolved
// `bottom: 0` to y = -height, so the entire UI (sidebar footer, composer) sat
// above the viewport while innerText still looked fine to the smoke test.
// It must be a flex:1 View, exactly like the native provider.
'use strict';

const React = require('react');
const { View } = require('react-native');

const { createStub } = require('./native-stub');

const wrap = (tag) =>
  function KeyboardWrapper(props) {
    return React.createElement(tag, { style: props && props.style }, props && props.children);
  };

function KeyboardProvider(props) {
  return React.createElement(
    View,
    { style: [{ flex: 1, minHeight: 0 }, props && props.style] },
    props && props.children,
  );
}

const zero = { value: 0 };

const useKeyboardState = () => ({ height: 0, isVisible: false, duration: 0, easing: 'easeOut' });
const useReanimatedKeyboardAnimation = () => ({ height: zero, progress: zero });
const useReanimatedFocusedInput = () => ({ input: { value: null } });
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
  KeyboardProvider,
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
