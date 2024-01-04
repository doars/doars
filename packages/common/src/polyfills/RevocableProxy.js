/**
 * Function to call to revoke the proxy.
 * @callback RevocableProxyCallback
 */

/**
 * @typedef RevocableProxy
 * @type {object}
 * @property {Proxy} proxy Proxy that will be revocable.
 * @property {RevocableProxyCallback} revoke Function to call to revoke the proxy.
 */

/**
 * Function called when a proxy has been handled.
 * @callback ProxyHandlerCallback
 */

/**
 * @typedef ProxyHandler
 * @type {object}
 * @property {?ProxyHandlerCallback} apply A trap method for a function call.
 * @property {?ProxyHandlerCallback} construct A trap for the `new` operator.
 * @property {?ProxyHandlerCallback} defineProperty A trap for `Object.defineProperty()`.
 * @property {?ProxyHandlerCallback} deleteProperty A trap for the `delete` operator.
 * @property {?ProxyHandlerCallback} get A trap for getting a property value.
 * @property {?ProxyHandlerCallback} getOwnPropertyDescriptor A trap for `Object.getOwnPropertyDescriptor()`.
 * @property {?ProxyHandlerCallback} getPrototypeOf A trap for the `[[GetPrototypeOf]]` internal method.
 * @property {?ProxyHandlerCallback} has A trap for the `in` operator.
 * @property {?ProxyHandlerCallback} isExtensible A trap for `Object.isExtensible()`.
 * @property {?ProxyHandlerCallback} ownKeys A trap for `Reflect.ownKeys()`.
 * @property {?ProxyHandlerCallback} preventExtensions A trap for `Object.preventExtensions()`.
 * @property {?ProxyHandlerCallback} set A trap for setting a property value.
 * @property {?ProxyHandlerCallback} setPrototypeOf A trap for `Object.setPrototypeOf()`.
 */

// List of methods to revoke access to.
const PROXY_TRAPS = [
  'apply',
  'construct',
  'defineProperty',
  'deleteProperty',
  'get',
  'getOwnPropertyDescriptor',
  'getPrototypeOf',
  'has',
  'isExtensible',
  'ownKeys',
  'preventExtensions',
  'set',
  'setPrototypeOf',
]

/**
 * Revocable proxy made using regular a proxy and a simple boolean.
 * @param {object} target Object to proxy.
 * @param {ProxyHandler} handler Object of handler methods.
 * @returns {?RevocableProxy} Proxy object and revoke method.
 */
export default (
  target,
  handler,
) => {
  // Keep track of status.
  let revoked = false

  // Add revocable handlers for each given handlers.
  /**
   * Copy of allowed handlers with a revocable layer in between.
   * @type {ProxyHandler}
   */
  const revocableHandler = {}
  for (const key of PROXY_TRAPS) {
    revocableHandler[key] = (...parameters) => {
      if (revoked) {
        return
      }

      if (key in handler) {
        return handler[key](...parameters)
      }
      return Reflect[key](...parameters)
    }
  }

  // Return proxy and revoke method.
  return {
    proxy: new Proxy(target, revocableHandler),
    revoke: () => {
      revoked = true
    },
  }
}
