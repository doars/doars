// Import polyfill.
import RevocableProxy from '../polyfills/RevocableProxy.js'

// Import event dispatcher.
import EventDispatcher from './EventDispatcher.js'

/**
 * @typedef ProxyOptions
 * @type {object}
 * @property {?boolean} delete Whether to dispatch an event on delete.
 * @property {?boolean} get Whether to dispatch an event on get.
 * @property {?boolean} set Whether to dispatch an event on set.
 */

export default class ProxyDispatcher extends EventDispatcher {
  /**
   * Creates a proxy dispatcher instance.
   * @param {ProxyOptions} options Options for proxy dispatcher.
   */
  constructor(
    options = {},
  ) {
    super()

    options = Object.assign({
      delete: true,
      get: true,
      set: true,
    }, options)

    // Setup WeakMap for keep track of created proxies.
    const map = new WeakMap()

    /**
     * Add object to start keeping track of it.
     * @param {object} target Object that is being kept track of.
     * @param {Array<string>} path Path of object on optional parent object, used for recursion.
     * @returns {Proxy} Object to access and mutate.
     */
    this.add = (
      target,
      path = [],
    ) => {
      // Exit early if proxy already exists.
      if (map.has(target)) {
        return map.get(target)
      }

      // Recursively create proxies for each property.
      for (const key in target) {
        if (target[key] && typeof (target[key]) === 'object') {
          target[key] = this.add(target[key], [...path, key])
        }
      }

      // Create handler and add the handler for which a callback exits..
      const handler = {}

      if (options.delete) {
        handler.deleteProperty = (
          target,
          key,
        ) => {
          // Exit early successful if property doesn't exist.
          if (!Reflect.has(target, key)) {
            return true
          }

          // Remove proxy.
          this.remove(target, key)

          // Delete property.
          const deleted = Reflect.deleteProperty(target, key)

          // Dispatch delete event.
          if (deleted) {
            this.dispatchEvent('delete', [target, Array.isArray(target) ? [...path] : [...path, key]])
          }

          // Return deleted.
          return deleted
        }
      }

      if (options.get) {
        handler.get = (
          target,
          key,
          receiver,
        ) => {
          // Dispatch get event.
          if (key !== Symbol.unscopables) {
            this.dispatchEvent('get', [target, [...path, key], receiver])
          }

          // Return value from object.
          return Reflect.get(target, key, receiver)
        }
      }

      if (options.set) {
        handler.set = (
          target,
          key,
          value,
          receiver,
        ) => {
          // Exit early if not changed.
          if (target[key] === value) {
            return true
          }

          // Add proxy if value is an object.
          if (value && typeof value === 'object') {
            value = this.add(value, [...path, key])
          }
          // Store value.
          target[key] = value

          // Dispatch set event. If the target is an array and a new item has been pushed then the length has also changed, therefore a more generalizable path will be dispatched.
          this.dispatchEvent('set', [target, Array.isArray(target) ? [...path] : [...path, key], value, receiver])

          // Return success.
          return true
        }
      }

      // Create proxy.
      const revocable = RevocableProxy(target, handler)

      // Store target at proxy.
      map.set(revocable, target)

      // Return proxy.
      return revocable.proxy
    }

    /**
     * Remove object from being kept track of.
     * @param {object} target Object that is being kept track of.
     */
    this.remove = (
      target,
    ) => {
      // Remove target from the map.
      if (!map.has(target)) {
        return
      }

      const revocable = map.get(target)
      map.delete(revocable)

      // Recursively remove properties as well.
      for (const property in revocable.proxy) {
        if (typeof (revocable.proxy[property]) === 'object') {
          this.remove(revocable.proxy[property])
        }
      }

      // Revoke proxy.
      revocable.revoke()
    }
  }
}
