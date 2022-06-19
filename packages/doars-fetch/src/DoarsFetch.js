// Import contexts.
import createFetchContext from './factories/contexts/fetch.js'
import createFetchDirective from './factories/directives/fetch.js'

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

      encodingConverters: {
        'application/json': () => { },
        'application/x-www-form-urlencoded': () => { },
        'multipart/formdata': () => { },
      },
    }, options)

    // Store contexts and directives.
    let fetchContext, fetchDirective

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      // Create and add contexts and directives.
      fetchContext = createFetchContext(options)
      library.addContexts(0, fetchContext)
      fetchDirective = createFetchDirective(options)
      library.addDirectives(-1, fetchDirective)
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove contexts and directives.
      library.removeContexts(fetchContext)
      fetchContext = null
      library.removeDirective(fetchDirective)
      fetchDirective = null
    })
  }
}
