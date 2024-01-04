/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the element context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  elementContextName,
}) => ({
  name: elementContextName,

  create: (
    component,
    attribute,
  ) => ({
    // Return the attribute's element.
    value: attribute.getElement(),
  }),
})
