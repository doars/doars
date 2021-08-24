// Import contexts.
import createFetchContext from './factories/contexts/fetch.js'

export default class DoarsFetch {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  constructor(library, options = null) {
    // Clone options.
    options = Object.assign({
      defaultInit: {},
    }, options)

    // Create contexts.
    const fetchContext = createFetchContext(options)

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      library.addContexts(0, fetchContext)
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      library.removeContexts(fetchContext)
    })
  }
}
