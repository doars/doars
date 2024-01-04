/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the watch directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  watchDirectiveName,
}) => ({
  name: watchDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) =>
    // Execute attribute expression.
    processExpression(
      component,
      attribute.clone(),
      attribute.getValue(),
      {},
      { return: false },
    ),
})
