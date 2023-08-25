// Import contexts.
import createContextUpdate from './factories/contexts/createUpdate.js'

// Import directives.
import createDirectiveUpdate from './factories/directives/createUpdate.js'

// Import updater.
import Updater from './Updater.js'

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
  let contextUpdate, directiveUpdate, updater

  const onEnable = (
  ) => {
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
  }

  const onDisable = (
  ) => {
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
