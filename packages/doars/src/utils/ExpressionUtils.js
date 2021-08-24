// Import polyfill.
import RevocableProxy from '../polyfills/RevocableProxy.js'

/**
 * Create an object with utility function.
 * @returns {Object} Utils.
 */
const createContextUtils = () => {
  return {
    createContexts: createContexts,
    createContextsProxy: createContextsProxy,
    RevocableProxy: RevocableProxy,
  }
}

/**
 * Create component's contexts for an attributes expression.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {Function} update Called when update needs to be invoked.
 * @param {Object} extra Optional extra context items.
 * @returns {Array<Object, Function>} Expressions contexts and destroy functions.
 */
export const createContexts = (component, attribute, update, extra = null) => {
  // Iterate over all contexts.
  const results = {}
  const destroyFunctions = []
  let after = ''
  let before = ''
  const contexts = component.getLibrary().getContexts()
  for (const context of contexts) {
    if (!context || !context.name) {
      continue
    }

    // Get context result.
    const result = context.create(component, attribute, update, createContextUtils())
    if (!result || !result.value) {
      continue
    }

    // Store destroy functions.
    if (result.destroy && typeof (result.destroy) === 'function') {
      destroyFunctions.push(result.destroy)
    }

    // Deconstruct options if marked as such.
    if (context.deconstruct && typeof (result.value) === 'object') {
      before += 'with(' + context.name + ') { '
      after += ' }'
    }

    // Store result value in context results.
    results[context.name] = result.value
  }

  // Add extra items to context.
  if (typeof (extra) === 'object') {
    for (const name in extra) {
      results[name] = extra[name]
    }
  }

  return {
    after: after,
    before: before,
    destroy: () => {
      // Call all destroy functions.
      for (const destroyFunction of destroyFunctions) {
        destroyFunction(createContextUtils())
      }
    },
    contexts: results,
  }
}

/**
 * Create component's contexts only after the context gets used.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {Object} extra Optional extra context items.
 * @param {Function} update Called when update needs to be invoked.
 * @returns {Proxy} Expressions contexts' proxy.
 */
export const createContextsProxy = (component, attribute, update, extra = null) => {
  // Store context after first call.
  let data = null
  // Create context proxy.
  const revocable = RevocableProxy({}, {
    get: (target, property) => {
      // Create context.
      if (!data) {
        data = createContexts(component, attribute, update, extra)
      }

      // Check if name exists in context.
      if (property in data.contexts) {
        // Call accessed callback if element or state is accessed.
        attribute.accessed(component.getId(), property)

        // Return value.
        return data.contexts[property]
      }

      // Try and get value from state.
      if (data.contexts.$state) {
        if (property in data.contexts.$state) {
          // Call accessed callback if element or state is accessed.
          attribute.accessed(component.getId(), '$state')

          // Return value.
          return data.contexts.$state[property]
        }
      }
    },
  })

  // Return context.
  return {
    contexts: revocable.proxy,
    destroy: () => {
      // Call destroy on created context.
      if (data && data.destroy) {
        data.destroy(component, attribute)
      }

      // Revoke proxy.
      revocable.revoke()
    },
  }
}

/**
 * Executes value in the correct context.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {String} expression Expression to execute.
 * @param {Object} extra Optional extra context items.
 * @param {Object} options Optional options object.
 * @returns {Any} Result of expression.
 */
export const executeExpression = (component, attribute, expression, extra = null, options = null) => {
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
  createContexts: createContexts,
  createContextsProxy: createContextsProxy,
  executeExpression: executeExpression,
}
