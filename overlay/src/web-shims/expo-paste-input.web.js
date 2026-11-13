// Web stand-in for expo-paste-input.
//
// The real TextInputWrapper is a native host that renders nothing under
// react-native-web, which took the whole composer field down with it. As a
// plain View it keeps children mounted and simply skips native paste events.
'use strict';

const React = require('react');
const { View } = require('react-native-web');

function TextInputWrapper(props) {
  return React.createElement(View, props, props.children);
}

module.exports = { TextInputWrapper };
module.exports.default = module.exports;
