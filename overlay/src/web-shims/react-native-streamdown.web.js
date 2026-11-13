// Web stand-in for react-native-streamdown.
//
// StreamdownText is a wrapper around the native EnrichedMarkdownText host, so on
// web it rendered nothing and assistant answers stayed invisible. This routes it
// to the plain-Text markdown shim instead.
'use strict';

const React = require('react');
const { EnrichedMarkdownText } = require('./react-native-enriched-markdown.web.js');

function StreamdownText(props) {
  return React.createElement(EnrichedMarkdownText, props);
}

module.exports = { StreamdownText };
module.exports.default = module.exports;
