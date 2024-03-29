/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Context.js').DestroyFunction} DestroyFunction
 * @typedef {import('../Context.js').UpdateFunction} UpdateFunction
 * @typedef {import('../Doars.js').ContextMap} ContextMap
 */

// Import polyfill.
import RevocableProxy from '@doars/common/src/polyfills/RevocableProxy.js'

/**
 * @typedef CreatedContexts
 * @type {object}
 * @property {ContextMap} contexts The contexts.
 * @property {() => never} destroy Destroy callback.
 * @property {string} before Text to place before function definition.
 * @property {string} after Text to place after function definition.
 * @property {Array<string>} deconstructed List of context names to deconstruct.
 */

/**
 * Create component's contexts for an attributes expression.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {UpdateFunction} update Called when update needs to be invoked.
 * @param {object|null} extra Optional extra context items.
 * @returns {CreatedContexts} Expressions contexts and destroy functions.
 */
export const createContexts = (
  component,
  attribute,
  update,
  extra = null,
) => {
  // Get library.
  const library = component.getLibrary()

  // Start with the simple contexts.
  const contexts = library.getSimpleContexts()

  /** @type {Array<string>} */
  const deconstructed = []
  let after = '', before = ''
  // Iterate over all contexts.
  const creatableContexts = library.getContexts()
  // Store destroy functions.
  /** @type {Array<DestroyFunction>} */
  const destroyFunctions = []
  for (const creatableContext of creatableContexts) {
    if (!creatableContext || !creatableContext.name) {
      continue
    }

    // Get context result.
    const result = creatableContext.create(
      component,
      attribute,
      update,
    )
    if (!result || !result.value) {
      continue
    }

    // Store destroy functions.
    if (result.destroy && typeof (result.destroy) === 'function') {
      destroyFunctions.push(result.destroy)
    }

    // Deconstruct options if marked as such.
    if (creatableContext.deconstruct && typeof (result.value) === 'object') {
      deconstructed.push(creatableContext.name)
      before += 'with(' + creatableContext.name + ') { '
      after += ' }'
    }

    // Store result value in context results.
    contexts[creatableContext.name] = result.value
  }

  // Add extra items to context.
  if (typeof (extra) === 'object') {
    for (const name in extra) {
      contexts[name] = extra[name]
    }
  }

  return {
    contexts,
    destroy: (
    ) => {
      // Call all destroy functions.
      for (const destroyFunction of destroyFunctions) {
        destroyFunction()
      }
    },

    after,
    before,
    deconstructed,
  }
}

/**
 * Create component's contexts only after the context gets used.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {UpdateFunction} update Called when update needs to be invoked.
 * @param {object|undefined} extra Optional extra context items.
 * @returns {Proxy} Expressions contexts' proxy.
 */
export const createContextsProxy = (
  component,
  attribute,
  update,
  extra = null,
) => {
  // Store context after first call.
  let data = null
  // Create context proxy.
  const revocable = RevocableProxy({}, {
    get: (
      target,
      property,
    ) => {
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
    destroy: (
    ) => {
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
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {object|undefined} extra Optional extra context items.
 * @returns {Array<ContextMap|() => never>} Contexts and destroy function.
 */
export const createAutoContexts = (
  component,
  attribute,
  extra = null,
) => {
  // Collect update triggers.
  const triggers = []
  const update = (id, context) => {
    triggers.push({
      id,
      path: context,
    })
  }

  // Create function context.
  const {
    contexts,
    destroy,
  } = createContexts(
    component,
    attribute,
    update,
    extra,
  )

  return [contexts, () => {
    // Invoke destroy.
    destroy()

    // Dispatch update triggers.
    if (triggers.length > 0) {
      component.getLibrary().update(triggers)
    }
  }]
}

export default {
  createAutoContexts,
  createContexts,
  createContextsProxy,
}
