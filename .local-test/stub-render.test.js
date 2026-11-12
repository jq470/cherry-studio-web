// Regression guard for the L1 stub layer: the Proxy must hand out the *real*
// `createStub` helper and the overrides each L2 shim supplies. When it does not,
// provider-style shims render `null` and silently remove the whole React tree
// (that is exactly how the web build went blank).
//
// Run with the upstream node_modules on NODE_PATH so react/react-dom resolve:
//   NODE_PATH=<upstream>/node_modules node .local-test/stub-render.test.js
const path = require('node:path');
const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');

const SHIMS = path.resolve(__dirname, '../overlay/src/web-shims');

const results = [];
const check = (name, ok, detail) => {
  results.push(`${ok ? 'PASS' : 'FAIL'} ${name}${ok ? '' : ` :: ${detail}`}`);
  return ok;
};

const stubModule = require(path.join(SHIMS, 'native-stub.js'));
check('createStub is a real function', typeof stubModule.createStub === 'function', typeof stubModule.createStub);
const custom = stubModule.createStub('probe', { answer: 42 });
check('overrides survive the proxy', custom.answer === 42, custom.answer);
check('unknown keys stay callable', typeof custom.whatever === 'function', typeof custom.whatever);

const kc = require(path.join(SHIMS, 'react-native-keyboard-controller.web.js'));
const keyboardMarkup = renderToStaticMarkup(
  React.createElement(kc.KeyboardProvider, { preload: true }, React.createElement('span', null, 'CHILD')),
);
check('KeyboardProvider renders children', keyboardMarkup.includes('CHILD'), keyboardMarkup);

const sentry = require(path.join(SHIMS, 'sentry-react-native.web.js'));
const Wrapped = sentry.wrap((props) => React.createElement('div', null, props.children));
const sentryMarkup = renderToStaticMarkup(React.createElement(Wrapped, null, React.createElement('b', null, 'WRAPPED')));
check('Sentry.wrap renders the wrapped tree', sentryMarkup.includes('WRAPPED'), sentryMarkup);

const webview = require(path.join(SHIMS, 'react-native-webview.web.js'));
const WebViewComponent = webview.WebView || webview.default;
const webviewMarkup = renderToStaticMarkup(
  React.createElement(WebViewComponent, { source: { uri: 'https://example.com' } }),
);
check('WebView renders a placeholder element', webviewMarkup.length > 0, webviewMarkup);

const inputAccessory = require(path.join(SHIMS, 'rnw-input-accessory-view.web.js'));
const accessoryMarkup = renderToStaticMarkup(
  React.createElement(inputAccessory.default || inputAccessory, null, React.createElement('i', null, 'ACC')),
);
check('InputAccessoryView keeps its children', accessoryMarkup.includes('ACC'), accessoryMarkup);

console.log(results.join('\n'));
const failed = results.filter((line) => line.startsWith('FAIL'));
if (failed.length) process.exit(1);
console.log(`\nall ${results.length} stub render checks passed`);
