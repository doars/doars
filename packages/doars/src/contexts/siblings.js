// Import polyfill.
import RevocableProxy from '@doars/common/src/polyfills/RevocableProxy.js'

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
  siblingsContextName,
}) => ({
  name: siblingsContextName,

  create: (
    component,
    attribute,
    update,
  ) => {
    const parent = component.getParent()
    if (!parent) {
      return {
        value: [],
      }
    }
    // Create contexts proxy for children.
    let siblingsContexts
    const revocable = RevocableProxy(
      parent
        .getChildren()
        .filter((sibling) => sibling !== component),
      {
        get: (target, key, receiver) => {
          if (!siblingsContexts) {
            // Create list of child contexts.
            siblingsContexts = target.map((child) => createContextsProxy(child, attribute, update))

            // Set children of this component as accessed.
            attribute.accessed(component.getId(), 'siblings')
          }

          // If not a number then do a normal access.
          if (isNaN(key)) {
            return Reflect.get(siblingsContexts, key, receiver)
          }

          // Return context from child.
          const sibling = Reflect.get(siblingsContexts, key, receiver)
          if (sibling) {
            return sibling.contexts
          }
        },
      },
    )

    return {
      value: revocable.proxy,

      destroy: (
      ) => {
        // Call destroy on all created contexts.
        if (siblingsContexts) {
          siblingsContexts.forEach((child) => child.destroy())
        }

        // Revoke proxy.
        revocable.revoke()
      },
    }
  },
})
