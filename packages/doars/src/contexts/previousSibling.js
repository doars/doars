import { createContextsProxy } from '../utilities/Context.js'

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the children context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  previousSiblingContextName,
}) => ({
  name: previousSiblingContextName,

  create: (
    component,
    attribute,
    update,
  ) => {
    const parent = component.getParent()
    if (!parent) {
      return {
        value: null,
      }
    }
    const siblings = parent.getChildren()
    const index = siblings.indexOf(component)
    if (index <= 0) {
      return {
        value: null,
      }
    }

    // Create contexts proxy for sibling.
    const {
      contexts,
      destroy,
    } = createContextsProxy(siblings[index - 1], attribute, update)

    return {
      value: contexts,

      destroy,
    }
  },
})
