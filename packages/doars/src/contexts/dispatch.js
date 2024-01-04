/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the dispatch context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  dispatchContextName,
}) => ({
  name: dispatchContextName,

  create: (
    component,
  ) => {
    // Return the dispatch method.
    return {
      value: (
        name,
        detail = {},
      ) => {
        // Dispatch the event after the elements have updated.
        component.getElement().dispatchEvent(
          new CustomEvent(name, {
            detail,
            bubbles: true,
          }),
        )
      },
    }
  },
})
