export default {
  name: '$component',

  create: (
    component,
  ) => {
    // Return the component's element.
    return {
      value: component.getElement(),
    }
  },
}
