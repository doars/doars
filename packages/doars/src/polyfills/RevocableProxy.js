// List of methods to revoke access to.
const REFLECTION_METHODS = [
  'apply',
  'construct',
  'defineProperty',
  'deleteProperty',
  'get',
  'getOwnPropertyDescriptor',
  'getPrototypeOf',
  'isExtensible',
  'ownKeys',
  'preventExtensions',
  'set',
  'setPrototypeOf',
]

/**
 * Revocable proxy made using regular a proxy and a simple boolean.
 */
export default function (target, handler) {
  // Keep track of status.
  let revoked = false

  // Add revocable handlers for each given handlers.
  const revocableHandler = {}
  for (const key of REFLECTION_METHODS) {
    revocableHandler[key] = (...parameters) => {
      if (revoked) {
        console.error('illegal operation attempted on a revoked proxy')
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
