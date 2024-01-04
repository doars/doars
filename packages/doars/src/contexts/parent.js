import { createContextsProxy } from '../utilities/Context.js'

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the parent context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  parentContextName,
}) => ({
  name: parentContextName,

  create: (
    component,
    attribute,
    update,
  ) => {
    // Deconstruct component.
    const parent = component.getParent()
    if (!parent) {
      return {
        value: null,
      }
    }

    // Create contexts proxy for parent.
    const {
      contexts,
      destroy,
    } = createContextsProxy(parent, attribute, update)

    return {
      value: contexts,

      destroy,
    }
  },
})
