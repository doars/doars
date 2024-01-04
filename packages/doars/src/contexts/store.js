import { deepAssign } from '@doars/common/src/utilities/Object.js'
import createStateContext from '@doars/common/src/factories/createStateContext.js'
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the store context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  storeContextDeconstruct,
  storeContextInitial,
  storeContextName,
}) => {
  // Create a single proxy for the store.
  const data = deepAssign({}, storeContextInitial)
  const proxy = new ProxyDispatcher()
  const state = proxy.add(data)

  return createStateContext(
    storeContextName,
    Symbol('ID_STORE'),
    state,
    proxy,
    storeContextDeconstruct,
  )
}
