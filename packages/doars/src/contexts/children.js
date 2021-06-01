export default {
  name: '$children',

  create: (component, attribute, update, { createContextsProxy, RevocableProxy }) => {
    // Create contexts proxy for children.
    let children
    const revocable = RevocableProxy(component.getChildren(), {
      get: (target, key, receiver) => {
        if (!children) {
          // Create list of child contexts.
          children = target.map((child) => createContextsProxy(child, attribute, update))

          // Set children of this component as accessed.
          attribute.accessed(component.getId(), 'children')
        }

        // If not a number then do a normal access.
        if (isNaN(key)) {
          return Reflect.get(children, key, receiver)
        }

        // Return context from child.
        const child = Reflect.get(children, key, receiver)
        if (child) {
          return child.contexts
        }
      },
    })

    return {
      value: revocable.proxy,

      destroy: () => {
        // Call destroy on all created contexts.
        if (children) {
          children.forEach((child) => child.destroy())
        }

        // Revoke proxy.
        revocable.revoke()
      },
    }
  },
}
