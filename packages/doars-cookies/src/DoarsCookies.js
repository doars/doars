// Import contexts.
import createCookieContext from './factories/contexts/cookies.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

import { getAll, set } from './utilities/cookies.js'

const id = Symbol('ID_COOKIES')

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {Object} options The plugin options.
 */
export default function (
  library,
  options = null,
) {
  // Clone options.
  options = Object.assign({
    deconstruct: false,
  }, options)

  // Set private variables.
  let isEnabled = false
  let context, data, proxy, state

  const onMutate = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested cookies impossible tried to set "' + path.join('.') + '".')
    }
    set(path[0], target[path[0]])
  }

  const onEnable = (
  ) => {
    // Create proxy.
    data = getAll()
    proxy = new ProxyDispatcher()
    state = proxy.add(data)

    // Add event listeners.
    proxy.addEventListener('delete', onMutate)
    proxy.addEventListener('set', onMutate)

    // Create contexts.
    context = createCookieContext(id, state, proxy, !!options.deconstruct)
    // Get index of state and insert the context directly before it.
    const existingContexts = library.getContexts()
    let stateIndex = 0
    for (let i = existingContexts.length - 1; i >= 0; i--) {
      const context = existingContexts[i]
      if (context.name === '$state') {
        stateIndex = i
        break
      }
    }
    library.addContexts(stateIndex, context)
  }

  const onDisable = (
  ) => {
    // Remove contexts.
    library.removeContexts(context)

    // Remove event listeners.
    proxy.removeEventListener('delete', onMutate)
    proxy.removeEventListener('set', onMutate)

    // Reset references.
    state = null
    proxy.remove(data)
    proxy = null
    data = null
    context = null
  }

  this.disable = (
  ) => {
    // Check if library is disabled.
    if (!library.getEnabled() && isEnabled) {
      isEnabled = false

      // Stop listening to enable state of the library.
      library.removeEventListener('enabling', onEnable)
      library.removeEventListener('disabling', onDisable)
    }
  }

  this.enable = (
  ) => {
    if (!isEnabled) {
      isEnabled = true

      // Listen to enable state of the library.
      library.addEventListener('enabling', onEnable)
      library.addEventListener('disabling', onDisable)
    }
  }

  // Automatically enable plugin.
  this.enable()
}
