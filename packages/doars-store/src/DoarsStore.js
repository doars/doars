// Import contexts.
import createContextStore from './factories/contexts/store.js'

// Import directive.
import createDirectiveSyncStore from './factories/directives/syncStore.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/doars/src/events/ProxyDispatcher.js'

// Import utils.
import { deepAssign } from '@doars/doars/src/utils/ObjectUtils.js'

export default class DoarsStore {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   * @param {Object} datastore Initial datastore's data.
   */
  constructor(library, options = null, datastore = {}) {
    // Clone options.
    options = Object.assign({
      deconstruct: false,
    }, options)

    // Set private variables.
    let contextStore, datastoreCopy, directiveSyncStore, proxy, store

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      // Create proxy.
      datastoreCopy = deepAssign({}, datastore)
      proxy = new ProxyDispatcher()
      store = proxy.add(datastoreCopy)

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

      // Create and add directive.
      directiveSyncStore = createDirectiveSyncStore(id, store)
      library.addDirectives(-1, directiveSyncStore)
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove contexts.
      library.removeContexts(contextStore)

      // Remove directive.
      library.removeDirective(directiveSyncStore)

      // Reset references.
      store = null
      proxy.remove(datastoreCopy)
      proxy = null
      datastoreCopy = null
      directiveSyncStore = null
      contextStore = null
    })
  }
}
