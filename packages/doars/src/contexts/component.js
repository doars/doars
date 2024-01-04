/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the component context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  componentContextName,
}) => ({
  name: componentContextName,

  create: (
    component,
  ) => ({
    // Return the component's element.
    value: component.getElement(),
  }),
})
