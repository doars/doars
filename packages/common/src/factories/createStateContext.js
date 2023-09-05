export default (
  name,
  id,
  state,
  proxy,
  deconstruct,
) => ({
  deconstruct,

  name,

  create: (
    component,
    attribute,
    update, {
      RevocableProxy,
    },
  ) => {
    // Create event handlers.
    const onDelete = (
      target,
      path,
    ) => update(id, name + '.' + path.join('.'))
    const onGet = (
      target,
      path,
    ) => attribute.accessed(id, name + '.' + path.join('.'))
    const onSet = (
      target,
      path,
    ) => update(id, name + '.' + path.join('.'))

    // Add event listeners.
    proxy.addEventListener('delete', onDelete)
    proxy.addEventListener('get', onGet)
    proxy.addEventListener('set', onSet)

    // Wrap in a revocable proxy.
    const revocable = RevocableProxy(state, {})

    return {
      value: revocable.proxy,

      // Remove event listeners.
      destroy: (
      ) => {
        proxy.removeEventListener('delete', onDelete)
        proxy.removeEventListener('get', onGet)
        proxy.removeEventListener('set', onSet)

        // Revoke access to state.
        revocable.revoke()
      },
    }
  },
})
