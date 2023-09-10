const NAME = '$state'

export default {
  deconstruct: true,

  name: NAME,

  create: (
    component,
    attribute,
    update, {
      RevocableProxy,
    },
  ) => {
    // Deconstruct component.
    const proxy = component.getProxy()
    const state = component.getState()
    if (!proxy || !state) {
      return
    }

    // Create event handlers.
    const onDelete = (target, path) => update(component.getId(), NAME + '.' + path.join('.'))
    const onGet = (target, path) => attribute.accessed(component.getId(), NAME + '.' + path.join('.'))
    const onSet = (target, path) => update(component.getId(), NAME + '.' + path.join('.'))

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
}
