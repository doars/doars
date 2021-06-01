export default {
  name: '$nextTick',

  create: (component, attribute, update, { createContexts }) => {
    // Keep track of callbacks.
    let callbacks

    // The setup process is delayed since we only want this code to run if the context is used.
    let isSetup = false
    const setup = () => {
      // Exit early if already setup.
      if (isSetup) {
        return
      }
      isSetup = true

      // Deconstruct component.
      const library = component.getLibrary()

      // Setup callbacks list.
      callbacks = []

      // Remove and invoke each callback in the list.
      const handleUpdate = () => {
        // Stop listening the update has happened.
        stopListening()

        // Create function context.
        const { contexts, destroy } = createContexts(component, attribute, update, {})

        // Invoke all callbacks.
        for (const callback of callbacks) {
          callback(contexts)
        }

        // Destroy contexts.
        destroy()
      }

      // Stop listening for the update event and attribute changes.
      const stopListening = () => {
        // Stop listening for updated event.
        library.removeEventListener('updated', handleUpdate)

        // Remove self from listening.
        attribute.removeEventListener('changed', stopListening)
        attribute.removeEventListener('destroyed', stopListening)
      }

      // Listen to the libraries updated event.
      library.addEventListener('updated', handleUpdate)

      // Stop listening if the attribute changes since this directive will be run again.
      attribute.addEventListener('changed', stopListening)
      attribute.addEventListener('destroyed', stopListening)
    }

    return {
      value: (callback) => {
        // Do delayed setup now.
        setup()

        // Add callback to list.
        callbacks.push(callback)
      },
    }
  },
}
