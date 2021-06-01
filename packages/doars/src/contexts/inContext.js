export default {
  name: '$inContext',

  create: (component, attribute, update, { createContexts }) => {
    return {
      value: (callback) => {
        // Create contexts.
        const { contexts, destroy } = createContexts(component, attribute, update, {})

        // Invoke callback and store its result.
        const result = callback(contexts)

        // Destroy contexts.
        destroy()

        // Return callback's result.
        return result
      },
    }
  },
}
