// Import contexts.
import contextRouter from './contexts/router.js'

// Import directives.
import createDirectiveRouter from './factories/directives/router.js'
import directiveRoute from './directives/route.js'
import directiveRouteTo from './directives/routeTo.js'

// Import utilities.
import { deepAssign } from '@doars/common/src/utilities/Object.js'

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
  options = deepAssign({}, options)

  // Set private variables.
  let isEnabled = false
  let directiveRouter

  const onEnable = function () {
    // Add contexts and directives.
    library.addContexts(0, contextRouter)
    directiveRouter = createDirectiveRouter(options)
    library.addDirectives(-1, directiveRouter, directiveRoute, directiveRouteTo)
  }
  const onDisable = function () {
    // Remove contexts and directives.
    library.removeContexts(contextRouter)
    library.removeDirectives(directiveRouter, directiveRoute, directiveRouteTo)
    directiveRouter = null
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
