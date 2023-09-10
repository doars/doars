export default {
  name: '$parent',

  create: (
    component,
    attribute,
    update, {
      createContextsProxy,
    },
  ) => {
    // Deconstruct component.
    const parent = component.getParent()
    if (!parent) {
      return {
        key: '$parent',
        value: null,
      }
    }

    // Create contexts proxy for parent.
    const { contexts, destroy } = createContextsProxy(parent, attribute, update)

    return {
      value: contexts,

      destroy,
    }
  },
}
