export default {
  name: 'cloak',

  update: function (component, attribute, { transitionIn }) {
    // Deconstruct attribute.
    const element = attribute.getElement()

    // Remove attribute from element.
    element.removeAttribute(
      component.getLibrary().getOptions().prefix + '-' + this.name
    )

    // Transition in.
    transitionIn(component, element)
  },
}
