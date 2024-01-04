import { createAutoContexts } from './Context.js'
import {
  parse,
  run,
} from '@doars/interpret'

/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 */

/**
 * Executes value in the correct context.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {string} expression Expression to execute.
 * @param {object|null} extra Optional extra context items.
 * @param {object|null} options Optional options object.
 * @returns {any} Result of expression.
 */
export const interpret = (
  component,
  attribute,
  expression,
  extra = null,
  options = null,
) => {
  // Override default with given options.
  options = Object.assign({
    return: true,
  }, options)

  // Create contexts.
  const [contexts, destroyContexts] = createAutoContexts(component, attribute, extra)

  // Get result from the expression.
  let result
  try {
    const expressionParsed = parse(expression)
    if (options.return && expressionParsed && expressionParsed.length > 1) {
      throw new Error('Unable to return a single value from a compound expression of: "' + expression + '".')
    }
    result = run(expressionParsed, contexts)
  } catch (error) {
    console.error('ExpressionError in:', expression, '\n' + error.name + ': ' + error.message)
    result = null
  }

  // Cleanup contexts.
  destroyContexts()

  // Unwrap results.
  if (options.return && result) {
    result = result[0]
    return result
  }
}

export default {
  interpret,
}
