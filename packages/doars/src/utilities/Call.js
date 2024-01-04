import { createAutoContexts } from './Context.js'
import { getDeeply } from '@doars/common/src/utilities/Object.js'

const PATH_VALIDATOR = /^[a-z$_]+[0-9a-z$_]*(?:\.[a-z$_]+[0-9a-z$_]*)*$/is

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
export const call = (
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
  expression = expression.trim()
  let result
  if (!PATH_VALIDATOR.test(expression)) {
    console.error('Error encountered when executing an expression. Expression is not a valid dot separated path: ', expression)
    result = null
  } else {
    result = getDeeply(contexts, expression.split('.'))
    if (typeof (result) === 'function') {
      try {
        result = result(contexts)
      } catch (error) {
        console.error('ExpressionError in:', expression, '\n' + error.name + ': ' + error.message)
        result = null
      }
    }
  }

  // Cleanup contexts.
  destroyContexts()

  if (options.return) {
    return result
  }
}

export default {
  call,
}
