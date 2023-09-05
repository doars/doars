// Import contexts.
import createContextLocalStorage from './factories/contexts/localStorage.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

import { getAll } from './utilities/localStorage.js'

const id = Symbol('ID_LOCAL_STORAGE')

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

  const onDelete = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join('.') + '".')
    }
    localStorage.removeItem(path[0])
  }
  const onSet = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join('.') + '".')
    }
    localStorage.setItem(path[0], target[path[0]])
  }

  const onEnable = (
  ) => {
    // Create proxy.
    data = getAll()
    proxy = new ProxyDispatcher()
    state = proxy.add(data)

    // Add event listeners.
    proxy.addEventListener('delete', onDelete)
    proxy.addEventListener('set', onSet)

    // Create contexts.
    context = createContextLocalStorage(id, state, proxy, !!options.deconstruct)
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
    proxy.removeEventListener('delete', onDelete)
    proxy.removeEventListener('set', onSet)

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
