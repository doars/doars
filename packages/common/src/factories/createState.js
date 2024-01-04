/**
 * @typedef {import('../events/ProxyDispatcher.js').ProxyDispatcher} ProxyDispatcher
 */

import RevocableProxy from '../polyfills/RevocableProxy.js'

/**
 * Factory function to create a context for a state which dispatched update events when mutated.
 * @param {string} name Name of the state.
 * @param {string} id Identifier of the state.
 * @param {object} state Data of the state.
 * @param {ProxyDispatcher} proxy Dispatcher to pass events through.
 * @returns {object} Proxied state and destroy callback.
 */
export default (
  name,
  id,
  state,
  proxy,
) => {
  return (
    component,
    attribute,
    update,
  ) => {
    // Create event handlers.
    const onDelete = (
      target,
      path,
    ) => update(id, name + '.' + path.join('.'))
    const onGet = (
      target,
      path,
    ) => attribute.accessed(id, name + '.' + path.join('.'))
    const onSet = (
      target,
      path,
    ) => update(id, name + '.' + path.join('.'))

    // Add event listeners.
    proxy.addEventListener('delete', onDelete)
    proxy.addEventListener('get', onGet)
    proxy.addEventListener('set', onSet)

    // Wrap in a revocable proxy.
    const revocable = RevocableProxy(state, {})

    return {
      value: revocable.proxy,

      // Remove event listeners.
      destroy: (
      ) => {
        proxy.removeEventListener('delete', onDelete)
        proxy.removeEventListener('get', onGet)
        proxy.removeEventListener('set', onSet)

        // Revoke access to state.
        revocable.revoke()
      },
    }
  }
}
