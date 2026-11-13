// Web stand-in for expo-paste-input.
//
// The real TextInputWrapper is a native host that renders nothing under
// react-native-web, which took the whole composer field down with it. A plain
// div keeps the field mounted and simply skips native paste events.
'use strict';

const React = require('react');

function TextInputWrapper(props) {
  return React.createElement(
    'div',
    { style: props && props.style, 'data-testid': props && props.testID },
    props && props.children,
  );
}

module.exports = { TextInputWrapper };
module.exports.default = module.exports;
