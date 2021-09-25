export default (options, id, store, proxy) => {
  return {
    deconstruct: !!options.deconstruct,

    name: '$store',

    create: (component, attribute, update, { RevocableProxy }) => {
      // Create event handlers.
      const onDelete = (target, path) => update(id, path.join('.'))
      const onGet = (target, path) => attribute.accessed(id, path.join('.'))
      const onSet = (target, path) => update(id, path.join('.'))

      // Add event listeners.
      proxy.addEventListener('delete', onDelete)
      proxy.addEventListener('get', onGet)
      proxy.addEventListener('set', onSet)

      // Wrap in a revocable proxy.
      const revocable = RevocableProxy(store, {})

      return {
        value: revocable.proxy,

        // Remove event listeners.
        destroy: () => {
          proxy.removeEventListener('delete', onDelete)
          proxy.removeEventListener('get', onGet)
          proxy.removeEventListener('set', onSet)

          // Revoke access to store.
          revocable.revoke()
        },
      }
    },
  }
}
