import { createContexts } from '../utilities/Context.js'

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the inContext context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  inContextContextName,
}) => ({
  name: inContextContextName,

  create: (
    component,
    attribute,
  ) => ({
    value: (
      callback,
    ) => {
      // Collect update triggers.
      const newTriggers = []
      const contextUpdate = (
        id,
        path,
      ) => {
        newTriggers.push({
          id,
          path,
        })
      }

      // Create contexts.
      const {
        contexts,
        destroy,
      } = createContexts(
        component,
        attribute,
        contextUpdate,
        {},
      )

      // Invoke callback and store its result.
      const result = callback(contexts)

      // Destroy contexts.
      destroy()

      // Dispatch update triggers.
      if (newTriggers.length > 0) {
        component.getLibrary().update(newTriggers)
      }

      // Return callback's result.
      return result
    },
  }),
})
