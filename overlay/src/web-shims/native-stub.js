// Generic browser stub for native-only modules.
//
// Purpose: Metro bundles every *static* require edge, even when the app only
// reaches it behind a `Platform.OS !== 'web'` guard or a
// `requireOptionalNativeModule()` null-check. Without a module to resolve, the
// whole web bundle fails. These packages are never actually exercised on the
// web path, so a universal no-op namespace is enough — one file instead of a
// dozen near-identical empty files.
//
// Design notes:
//   * `then` is deliberately undefined so `await stub` resolves instead of
//     hanging forever on a fake thenable.
//   * Property reads return further stubs, so `X.foo.bar()` never throws.
//   * Called with something that looks like React props it returns `null`,
//     which keeps `X()` usable as a JSX component (React renders nothing).
'use strict';

function createStub(label, overrides) {
  const cache = new Map();
  const base = overrides || {};
  const target = function stub() {};

  const child = (key) => {
    if (!cache.has(key)) cache.set(key, createStub(`${label}.${String(key)}`));
    return cache.get(key);
  };

  return new Proxy(target, {
    get(_target, key) {
      if (key === 'then') return undefined;
      if (key === 'toString') return () => `[${label}]`;
      if (key === 'valueOf') return () => 0;
      if (key === Symbol.toPrimitive) return () => '';
      if (key === Symbol.iterator) return function* empty() {};
      if (key === 'prototype') return target.prototype;
      if (key === 'constructor') return target;
      if (key === 'toJSON') return () => ({});
      if (typeof key === 'string' && Object.prototype.hasOwnProperty.call(base, key)) {
        return base[key];
      }
      // Properties assigned onto the stub itself (module.exports.createStub,
      // .default, ...) must win over synthesized children, otherwise requiring
      // this module hands out a fake `createStub` and every real shim silently
      // becomes a null-rendering stub — which removes the whole React tree.
      if (typeof key === 'string' && Object.prototype.hasOwnProperty.call(target, key)) {
        return target[key];
      }
      return child(key);
    },
    apply(_target, _thisArg, args) {
      const first = args[0];
      if (
        first &&
        typeof first === 'object' &&
        ('children' in first || '$$typeof' in first || 'style' in first)
      ) {
        // React element construction: render nothing.
        return null;
      }
      return createStub(`${label}()`);
    },
    construct() {
      return createStub(`new ${label}`);
    },
    has() {
      return true;
    },
    // No ownKeys / getOwnPropertyDescriptor traps on purpose: the Proxy target is
    // a function, whose `name`/`length`/`prototype` are non-configurable. Reporting
    // synthetic descriptors violates the Proxy invariants and throws
    // "Cannot redefine property" as soon as anything assigns a property.
  });
}

module.exports = createStub('native');
module.exports.createStub = createStub;
module.exports.default = module.exports;
