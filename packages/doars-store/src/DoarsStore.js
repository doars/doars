// Import contexts.
import createContextStore from './factories/contexts/store.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

// Import utils.
import { deepAssign } from '@doars/common/src/utils/Object.js'

export default class DoarsStore {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   * @param {Object} dataStore Initial store data.
   */
  constructor(library, options = null, dataStore = {}) {
    // Clone options.
    options = Object.assign({
      deconstruct: false,
    }, options)

    // Set private variables.
    let contextStore, dataStoreCopy, proxy, store

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
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
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove contexts.
      library.removeContexts(contextStore)

      // Reset references.
      store = null
      proxy.remove(dataStoreCopy)
      proxy = null
      dataStoreCopy = null
      directiveSyncStore = null
      contextStore = null
    })
  }
}
