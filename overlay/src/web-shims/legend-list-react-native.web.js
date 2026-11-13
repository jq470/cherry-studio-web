// Web entry for @legendapp/list/react-native, used by @legendapp/list/keyboard.
//
// Re-export whatever the package's own browser build provides (it is a pure
// React list implementation), so keyboard-aware lists keep their rows on web.
'use strict';

module.exports = require('@legendapp/list/react-native.web.js');
