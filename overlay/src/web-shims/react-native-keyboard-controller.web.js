// react-native-keyboard-controller on web.
//
// 25 call sites: the provider must render, the hooks must return values that
// callers can read (`height.value`, `isVisible`, `input.value`), and the
// controller is a no-op (there is no soft keyboard in a browser).
'use strict';

const React = require('react');

const { createStub } = require('./native-stub');
const ReactNativeWeb = require('react-native-web');

const wrap = (tag) =>
  function KeyboardWrapper(props) {
    return React.createElement(tag, { style: props && props.style }, props && props.children);
  };

const zero = { value: 0 };

// @legendapp/list/keyboard renders its rows through this scroll host; without it
// the whole transcript subtree was dropped and the chat looked empty.
const KeyboardChatScrollView = React.forwardRef(function KeyboardChatScrollView(props, ref) {
  const ScrollView =
    ReactNativeWeb.ScrollView || (ReactNativeWeb.default && ReactNativeWeb.default.ScrollView);
  return React.createElement(
    ScrollView,
    {
      ref,
      style: props && props.style,
      contentContainerStyle: props && props.contentContainerStyle,
      onScroll: props && props.onScroll,
      scrollEventThrottle: props && props.scrollEventThrottle,
      showsVerticalScrollIndicator: false,
    },
    props && props.children,
  );
});

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
  KeyboardProvider: wrap('div'),
  KeyboardAwareScrollView: wrap('div'),
  KeyboardChatScrollView,
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
