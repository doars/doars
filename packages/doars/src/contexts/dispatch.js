export default {
  name: '$dispatch',

  create: (component) => {
    // Return the dispatch method.
    return {
      value: (name, detail = {}) => {
        // Dispatch the event after the elements have updated.
        component.getElement().dispatchEvent(
          new CustomEvent(name, {
            detail,
            bubbles: true,
          })
        )
      },
    }
  },
}
