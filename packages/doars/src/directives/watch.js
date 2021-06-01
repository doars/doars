export default {
  name: 'watch',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const value = attribute.getValue()

    // Execute attribute expression.
    executeExpression(component, attribute, value, {}, {
      return: false,
    })
  },
}
