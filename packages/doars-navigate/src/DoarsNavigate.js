/**
 * @typedef {import('@doars/doars').default} Doars
 */

import createNavigateDirective from './directives/navigate.js'

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {object} options The plugin options.
 */
const DoarsNavigate = function (
  library,
  options = null,
) {
  // Clone options.
  options = Object.assign({
    fetchOptions: {},
    intersectionMargin: '0px',
    intersectionThreshold: 0,
    navigateDirectiveName: 'navigate',
  }, options)

  // Set private variables.
  let isEnabled = false
  // Store contexts and directives.
  const navigateDirective = createNavigateDirective(options)

  const onEnable = (
  ) => {
    // Create and add contexts and directives.
    library.addDirectives(-1, navigateDirective)
  }

  const onDisable = (
  ) => {
    // Remove contexts and directives.
    library.removeDirective(navigateDirective)
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

export default DoarsNavigate
