// Import contexts.
import createFetchContext from './factories/contexts/fetch.js'
import createFetchDirective from './factories/directives/fetch.js'

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {Object} options The plugin options.
 */
export default function (
  library,
  options = null
) {
  // Clone options.
  options = Object.assign({
    defaultInit: {},

    encodingConverters: {
      'application/json': () => { },
      'application/x-www-form-urlencoded': () => { },
      'multipart/formdata': () => { },
    },
  }, options)

  // Set private variables.
  let isEnabled = false
  // Store contexts and directives.
  let fetchContext, fetchDirective

  const onEnable = function () {
    // Create and add contexts and directives.
    fetchContext = createFetchContext(options)
    library.addContexts(0, fetchContext)
    fetchDirective = createFetchDirective(options)
    library.addDirectives(-1, fetchDirective)
  }
  const onDisable = function () {
    // Remove contexts and directives.
    library.removeContexts(fetchContext)
    fetchContext = null
    library.removeDirective(fetchDirective)
    fetchDirective = null
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
