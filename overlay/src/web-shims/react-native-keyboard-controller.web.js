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
// It must be a flex-growing container, exactly like the native provider.
//
// A plain DOM node with CSS flex is used on purpose: importing `View` from
// `react-native` at module scope hits RNW's own initialisation (React error #130
// because View is still undefined at that point), and a lazy require inside
// render is too fragile for a module this central.
'use strict';

const React = require('react');

const { createStub } = require('./native-stub');

const PROVIDER_STYLE = {
  display: 'flex',
  flexDirection: 'column',
  flexGrow: 1,
  flexShrink: 1,
  flexBasis: '0%',
  minHeight: 0,
  width: '100%',
  height: '100%',
};

const wrap = (tag) =>
  function KeyboardWrapper(props) {
    return React.createElement(tag, { style: props && props.style }, props && props.children);
  };

function KeyboardProvider(props) {
  const style = props && props.style ? [PROVIDER_STYLE, props.style] : PROVIDER_STYLE;
  return React.createElement('div', { style }, props && props.children);
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
