export default {
  name: 'watch',

  update: (
    component,
    attribute, {
      processExpression,
    },
  ) => {
    // Deconstruct attribute.
    const value = attribute.getValue()

    // Execute attribute expression.
    processExpression(component, attribute, value, {}, {
      return: false,
    })
  },
}
