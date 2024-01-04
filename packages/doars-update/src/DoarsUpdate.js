/**
 * @typedef {import('@doars/doars').default} Doars
 */

import createUpdateContext from './contexts/update.js'
import createUpdateDirective from './directives/update.js'
import Updater from './Updater.js'

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
    defaultOrder: 500,
    stepMinimum: 0,
    updateContextName: '$update',
    updateDirectiveName: 'update',
  }, options)

  // Set private variables.
  let isEnabled = false
  // Setup update loop.
  const updater = new Updater(
    options,
    () => {
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
    },
  )
  const contextUpdate = createUpdateContext(options, updater)
  const [directiveUpdate, update] = createUpdateDirective(options)

  const onEnable = (
  ) => {
    // Add contexts and directives.
    library.addContexts(0, contextUpdate)
    library.addDirectives(-1, directiveUpdate)
    // Enable updater.
    updater.enable()
  }

  const onDisable = (
  ) => {
    // Remove contexts and directives.
    library.removeContexts(contextUpdate)
    library.removeDirectives(directiveUpdate)
    // Disable updater.
    updater.disable()
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
