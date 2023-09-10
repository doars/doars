// Import directives.
import createDirectiveIntersect from './factories/directives/intersect.js'

// Import observer.
import IntersectionObserver from './IntersectionObserver.js'

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
  options = Object.assign({}, options)

  // Set private variables.
  let isEnabled = false
  let directiveView, intersectionObserver

  const onEnable = (
  ) => {
    // Overwrite default options.
    const _options = Object.assign({}, options)
    if (!_options.root) {
      _options.root = library.getOptions().root
    }

    // Setup observer.
    intersectionObserver = new IntersectionObserver(options)

    // Create and add directive.
    directiveView = createDirectiveIntersect(intersectionObserver)
    library.addDirectives(-1, directiveView)
  }

  const onDisable = (
  ) => {
    // Remove directive.
    library.removeDirectives(directiveView)
    directiveView = null

    // Remove observer.
    intersectionObserver = null
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
