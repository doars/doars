import { createContexts } from './Context.js'

/**
 * Executes value in the correct context.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {String} expression Expression to execute.
 * @param {Object} extra Optional extra context items.
 * @param {Object} options Optional options object.
 * @returns {Any} Result of expression.
 */
export const execute = (component, attribute, expression, extra = null, options = null) => {
  // Override default with given options.
  options = Object.assign({
    return: true,
  }, options)

  // Collect update triggers.
  const triggers = []
  const update = (id, context) => {
    triggers.push({
      id: id,
      path: context,
    })
  }

  // Create function context.
  let { after, before, contexts, destroy } = createContexts(component, attribute, update, extra)

  // Apply options.
  if (options.return) {
    before += 'return '
  }

  // Try to execute code.
  let result
  try {
    result = new Function(...Object.keys(contexts), before + expression + after)(...Object.values(contexts)) // eslint-disable-line no-new-func
  } catch (error) {
    console.error(error, 'Error encountered when executing the following expression: ', expression)
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
  execute: execute,
}
