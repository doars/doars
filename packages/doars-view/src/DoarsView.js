// Import directives.
import createDirectiveView from './factories/directives/view.js'

// Import observer.
import ViewObserver from './ViewObserver.js'

class DoarsView {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  constructor(library, options = null) {
    // Store options.
    options = Object.assign({}, options)

    // Set private variables.
    let directiveView, observer

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      // Overwrite default options.
      const _options = Object.assign({}, options)
      if (!_options.root) {
        _options.root = library.getOptions().root
      }

      // Setup observer.
      observer = new ViewObserver(options)

      // Create and add directive.
      directiveView = createDirectiveView(observer)
      library.addDirectives(-1, directiveView)
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove directive.
      library.removeDirectives(directiveView)
      directiveView = null

      // Remove observer.
      observer = null
    })
  }
}

export default DoarsView
