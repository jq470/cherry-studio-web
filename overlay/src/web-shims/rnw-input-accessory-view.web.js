// react-native-web 0.21.4 resolves `./exports/InputAccessoryView` as a directory
// entry that Metro cannot find under pnpm's layout, which aborts the whole web
// bundle. This component is only used for iOS keyboard accessory bars and never
// renders on web.
//
// Must not import react-native: doing so pulls the native RN core into the web
// bundle and yields `View is undefined` through a circular dependency.
'use strict';

const React = require('react');

function InputAccessoryView(props) {
  return React.createElement('div', { style: props && props.style }, props && props.children);
}

module.exports = InputAccessoryView;
module.exports.default = InputAccessoryView;
