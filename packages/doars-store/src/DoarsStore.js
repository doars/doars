// Import contexts.
import createContextStore from './factories/contexts/store.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

// Import utilities.
import { deepAssign } from '@doars/common/src/utilities/Object.js'

const id = Symbol('ID_STORE')

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {Object} options The plugin options.
 * @param {Object} dataStore Initial store data.
 */
export default function (
  library,
  options = null,
  dataStore = {},
) {
  // Clone options.
  options = Object.assign({
    deconstruct: false,
  }, options)

  // Set private variables.
  let isEnabled = false
  let contextStore, data, proxy, store

  const onEnable = (
  ) => {
    // Create proxy.
    data = deepAssign({}, dataStore)
    proxy = new ProxyDispatcher()
    store = proxy.add(data)

    // Create contexts.
    contextStore = createContextStore(id, store, proxy, !!options.deconstruct)
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
    library.addContexts(stateIndex, contextStore)
  }

  const onDisable = (
  ) => {
    // Remove contexts.
    library.removeContexts(contextStore)

    // Reset references.
    store = null
    proxy.remove(data)
    proxy = null
    data = null
    contextStore = null
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
