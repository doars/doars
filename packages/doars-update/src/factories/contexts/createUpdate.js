export default function (updater) {
  // Deconstruct updater.
  const id = updater.getId()
  const proxy = updater.getProxy()
  const time = updater.getTime()

  return {
    name: '$update',

    create: (component, attribute) => {
      // Create event handlers.
      const onGet = (target, path) => attribute.accessed(id, path.join('.'))

      // Add event listeners.
      proxy.addEventListener('get', onGet)

      return {
        value: time,

        // Remove event listeners.
        destroy: () => {
          proxy.removeEventListener('get', onGet)
        },
      }
    },
  }
}
