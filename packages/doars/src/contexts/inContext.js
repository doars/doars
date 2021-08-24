export default {
  name: '$inContext',

  create: (component, attribute, update, { createContexts }) => {
    return {
      value: (callback) => {
        // Collect update triggers.
        const triggers = []
        const contextUpdate = (id, context) => {
          triggers.push({
            id: id,
            path: context,
          })
        }

        // Create contexts.
        const { contexts, destroy } = createContexts(component, attribute, contextUpdate, {})

        // Invoke callback and store its result.
        const result = callback(contexts)

        // Destroy contexts.
        destroy()

        // Dispatch update triggers.
        if (triggers.length > 0) {
          component.getLibrary().update(triggers)
        }

        // Return callback's result.
        return result
      },
    }
  },
}
