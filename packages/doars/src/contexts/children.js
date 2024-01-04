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
  childrenContextName,
}) => ({
  name: childrenContextName,

  create: (
    component,
    attribute,
    update,
  ) => {
    // Create contexts proxy for children.
    let childrenContexts
    const revocable = RevocableProxy(component.getChildren(), {
      get: (target, key, receiver) => {
        if (!childrenContexts) {
          // Create list of child contexts.
          childrenContexts = target.map((child) => createContextsProxy(child, attribute, update))

          // Set children of this component as accessed.
          attribute.accessed(component.getId(), 'children')
        }

        // If not a number then do a normal access.
        if (isNaN(key)) {
          return Reflect.get(childrenContexts, key, receiver)
        }

        // Return context from child.
        const child = Reflect.get(childrenContexts, key, receiver)
        if (child) {
          return child.contexts
        }
      },
    })

    return {
      value: revocable.proxy,

      destroy: (
      ) => {
        // Call destroy on all created contexts.
        if (childrenContexts) {
          childrenContexts.forEach((child) => child.destroy())
        }

        // Revoke proxy.
        revocable.revoke()
      },
    }
  },
})
