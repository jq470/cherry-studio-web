// Web entry for @legendapp/list/react-native, used by @legendapp/list/keyboard.
//
// Re-export the package's own browser build: the keyboard wrapper only needs a
// JS list, but the default native entry mounts no rows on web.
'use strict';

module.exports = require('@legendapp/list/react-native');
