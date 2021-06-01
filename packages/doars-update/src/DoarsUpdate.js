// Import contexts.
import createContextUpdate from './factories/contexts/createUpdate.js'

// Import directives.
import createDirectiveUpdate from './factories/directives/createUpdate.js'

// Import updater.
import Updater from './Updater.js'

class DoarsUpdate {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  constructor(library, options = null) {
    options = Object.assign({}, options)

    // Set private variables.
    let contextUpdate, directiveUpdate, updater

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      // Create and add directive.
      const [_directiveUpdate, update] = createDirectiveUpdate(options)
      directiveUpdate = _directiveUpdate
      library.addDirectives(-1, directiveUpdate)

      // Setup update loop.
      updater = new Updater(options, () => {
        // Update all directives.
        update()

        // Dispatch update triggers.
        library.update([{
          id: updater.getId(),
          path: 'current',
        }, {
          id: updater.getId(),
          path: 'delta',
        }, {
          id: updater.getId(),
          path: 'last',
        }, {
          id: updater.getId(),
          path: 'passed',
        }])
      })

      // Create and add context.
      contextUpdate = createContextUpdate(updater)
      library.addContexts(0, contextUpdate)

      // Enable updater.
      updater.enable()
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove context.
      library.removeContexts(contextUpdate)

      // Remove directive.
      library.removeDirectives(directiveUpdate)

      // Disable updater.
      updater.disable()

      // Reset private variables.
      contextUpdate = null
      directiveUpdate = null
      updater = null
    })
  }
}

export default DoarsUpdate
