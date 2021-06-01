export default {
  name: 'show',

  update: (component, attribute, { executeExpression, transitionIn, transitionOut }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    // Execute attribute value.
    const data = executeExpression(component, attribute, attribute.getValue())

    // Assign display based on truthiness of expression result.
    if (data) {
      element.style.display = null
      transitionIn(component, element)
    } else {
      transitionOut(component, element, () => {
        element.style.display = 'none'
      })
    }
  },
}
