// Import contexts.
import createContextStore from './factories/contexts/store.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

// Import utilities.
import { deepAssign } from '@doars/common/src/utilities/Object.js'

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {Object} options The plugin options.
 * @param {Object} dataStore Initial store data.
 */
export default function (
  library,
  options = null,
  dataStore = {}
) {
  // Clone options.
  options = Object.assign({
    deconstruct: false,
  }, options)

  // Set private variables.
  let isEnabled = false
  let contextStore, dataStoreCopy, proxy, store

  const onEnable = function () {
    // Create proxy.
    dataStoreCopy = deepAssign({}, dataStore)
    proxy = new ProxyDispatcher()
    store = proxy.add(dataStoreCopy)

    // Create store id.
    const id = Symbol('ID_STORE')

    // Create contexts.
    contextStore = createContextStore(options, id, store, proxy)
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
  const onDisable = function () {
    // Remove contexts.
    library.removeContexts(contextStore)

    // Reset references.
    store = null
    proxy.remove(dataStoreCopy)
    proxy = null
    dataStoreCopy = null
    contextStore = null
  }

  this.disable = function () {
    // Check if library is disabled.
    if (!library.getEnabled() && isEnabled) {
      isEnabled = false

      // Stop listening to enable state of the library.
      library.removeEventListener('enabling', onEnable)
      library.removeEventListener('disabling', onDisable)
    }
  }

  this.enable = function () {
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
