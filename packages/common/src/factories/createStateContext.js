import createState from './createState.js'

/**
 * @typedef {import('../events/ProxyDispatcher.js').default} ProxyDispatcher
 * @typedef {import('../polyfills/RevocableProxy.js').RevocableProxy} RevocableProxy
 */

/**
 * Function called when the context needs to be destroyed.
 * @callback DestroyStateContext
 */

/**
 * @typedef StateContext
 * @type {object}
 * @property {Proxy} value The proxy of the state to mutate.
 * @property {DestroyStateContext} destroy The proxy of the state.
 */

/**
 * Factory function to create a context for a state which dispatched update events when mutated.
 * @param {string} name Name of the state.
 * @param {string} id Identifier of the state.
 * @param {object} state Data of the state.
 * @param {ProxyDispatcher} proxy Dispatcher to pass events through.
 * @param {boolean} deconstruct Whether to deconstruct the state or require the name prefix.
 * @returns {object} Proxied state and destroy callback.
 */
export default (
  name,
  id,
  state,
  proxy,
  deconstruct,
) => ({
  deconstruct,

  name,

  create: createState(
    name,
    id,
    state,
    proxy,
  ),
})
