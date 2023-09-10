export default {
  name: '$element',

  create: (
    component,
    attribute,
  ) => {
    // Return the attribute's element.
    return {
      value: attribute.getElement(),
    }
  },
}
