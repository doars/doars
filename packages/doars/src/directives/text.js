export default {
  name: 'text',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    // Execute value and retrieve text.
    const text = executeExpression(component, attribute, attribute.getValue())

    // Assign text.
    if (modifiers.content) {
      if (element.textContent !== text) {
        element.textContent = text
      }
    } else if (element.innerText !== text) {
      element.innerText = text
    }
  },
}
