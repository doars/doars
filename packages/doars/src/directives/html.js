export default {
  name: 'html',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    // Execute value and retrieve html.
    const html = executeExpression(component, attribute, attribute.getValue())

    // Assign html.
    if (element.innerHTML !== html) {
      element.innerHTML = html
    }
  },
}
