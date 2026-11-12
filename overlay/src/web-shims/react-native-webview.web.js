// react-native-webview on web: an <iframe> with the same prop surface the app
// uses (source.uri / source.html, onMessage, onLoadEnd, injectedJavaScript).
//
// Keeping a real element (instead of a null component) matters because the app
// renders webviews for Mermaid / file previews / MCP apps; a null component
// leaves empty panes with no way to post messages back.
'use strict';

const React = require('react');

function toSrc(source) {
  if (!source) return 'about:blank';
  if (typeof source === 'string') return source;
  if (source.uri) return source.uri;
  if (source.html) return `data:text/html;charset=utf-8,${encodeURIComponent(source.html)}`;
  return 'about:blank';
}

function WebView(props) {
  const { source, style, onLoadEnd, onMessage, injectedJavaScript, ...rest } = props || {};
  const ref = React.useRef(null);

  React.useEffect(() => {
    if (typeof injectedJavaScript !== 'string' || !ref.current) return;
    try {
      const frame = ref.current;
      if (frame && frame.contentWindow) frame.contentWindow.eval(injectedJavaScript);
    } catch {
      /* cross-origin frames cannot be scripted */
    }
  }, [injectedJavaScript]);

  React.useEffect(() => {
    if (typeof onMessage !== 'function') return undefined;
    const listener = (event) => onMessage({ nativeEvent: { data: String(event.data) } });
    window.addEventListener('message', listener);
    return () => window.removeEventListener('message', listener);
  }, [onMessage]);

  return React.createElement('iframe', {
    ref,
    src: toSrc(source),
    style: { border: 0, width: '100%', height: '100%', ...(style || {}) },
    onLoad: () => {
      if (typeof onLoadEnd === 'function') onLoadEnd({ nativeEvent: {} });
    },
    ...rest,
  });
}

module.exports = { WebView, default: WebView, WebViewProps: {} };
module.exports.WebView = WebView;
module.exports.default = WebView;
