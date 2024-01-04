/**
 * @typedef {import('@doars/doars').default} Doars
 */

import createFetchContext from './contexts/fetch.js'
import createFetchDirective from './directives/fetch.js'

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {object} options The plugin options.
 */
export default function (
  library,
  options = null,
) {
  // Clone options.
  options = Object.assign({
    fetchContextName: '$fetch',
    fetchDirectiveEvaluate: true,
    fetchDirectiveName: 'fetch',
    fetchOptions: {},
  }, options)
  if (options.defaultInit) {
    Object.assign(options.fetchOptions, options.defaultInit)
  }

  // Set private variables.
  let isEnabled = false
  // Store contexts and directives.
  const fetchContext = createFetchContext(options),
    fetchDirective = createFetchDirective(options)

  const onEnable = (
  ) => {
    // Create and add contexts and directives.
    library.addContexts(0, fetchContext)
    library.addDirectives(-1, fetchDirective)
  }

  const onDisable = (
  ) => {
    // Remove contexts and directives.
    library.removeContexts(fetchContext)
    library.removeDirective(fetchDirective)
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
