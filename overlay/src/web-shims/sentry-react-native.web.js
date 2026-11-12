// @sentry/react-native on web.
//
// The native SDK has no browser entry and its `wrap` is called unconditionally
// during app bootstrap (`Sentry.wrap is not a function` kills startup). Web
// builds keep the same call graph but ship no crash reporting, so `wrap` is an
// identity function and everything else is a no-op.
'use strict';

const { createStub } = require('./native-stub');

const scope = {
  setTag: () => {},
  setExtra: () => {},
  setContext: () => {},
  setLevel: () => {},
  setUser: () => {},
  addBreadcrumb: () => {},
};

const span = {
  end: () => {},
  setStatus: () => {},
  setAttribute: () => {},
  setData: () => {},
};

const base = {
  wrap: (component) => component,
  init: () => {},
  captureException: () => {},
  captureMessage: () => {},
  captureEvent: () => {},
  addBreadcrumb: () => {},
  setUser: () => {},
  setTag: () => {},
  setExtra: () => {},
  setContext: () => {},
  configureScope: (callback) => {
    try {
      callback(scope);
    } catch {
      /* ignore */
    }
  },
  withScope: (callback) => {
    try {
      callback(scope);
    } catch {
      /* ignore */
    }
  },
  startSpan: (options, callback) => (typeof callback === 'function' ? callback(span) : undefined),
  startInactiveSpan: () => span,
  startTransaction: () => ({ ...span, finish: () => {} }),
  getCurrentScope: () => scope,
  getIsolationScope: () => scope,
  reactNativeTracingIntegration: () => ({}),
  reactNativeErrorHandlersIntegration: () => ({}),
  defaultIntegrations: [],
  makeFetchTransport: () => () => Promise.resolve({ statusCode: 200 }),
  eventFromException: () => Promise.resolve({}),
  eventFromMessage: () => Promise.resolve({}),
  Severity: { Fatal: 'fatal', Error: 'error', Warning: 'warning', Log: 'log', Info: 'info', Debug: 'debug' },
  SeverityLevel: { Fatal: 'fatal', Error: 'error', Warning: 'warning', Info: 'info', Debug: 'debug' },
  enableUserInteractionTracing: () => {},
  enableNativeCrashHandling: () => {},
  nativeCrash: () => {},
};

const shim = createStub('@sentry/react-native', base);

module.exports = shim;
module.exports.default = shim;
