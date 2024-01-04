// Import context.
import { createContexts } from './Context.js'

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
export const execute = (
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

  // Collect update triggers.
  const triggers = []
  const update = (id, context) => {
    triggers.push({
      id,
      path: context,
    })
  }

  // Create function context.
  let {
    after,
    before,
    contexts,
    destroy,
  } = createContexts(
    component,
    attribute,
    update,
    extra,
  )

  // Apply options.
  if (options.return) {
    before += 'return '
  }

  // Try to execute code.
  let result
  try {
    result = new Function(...Object.keys(contexts), before + expression + after)(...Object.values(contexts)) // eslint-disable-line no-new-func
  } catch (error) {
    console.error('ExpressionError in:', expression, '\n' + error.name + ': ' + error.message)
    result = null
  }

  // Invoke destroy.
  destroy()

  // Dispatch update triggers.
  if (triggers.length > 0) {
    component.getLibrary().update(triggers)
  }

  return result
}

export default {
  execute,
}
