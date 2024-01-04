/**
 * @typedef {import('@doars/doars').default} Doars
 */

import { deepAssign } from '@doars/common/src/utilities/Object.js'

import createRouterContext from './contexts/router.js'
import createRouteDirective from './directives/route.js'
import createRouterDirective from './directives/router.js'
import createRouteToDirective from './directives/routeTo.js'

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
  options = deepAssign({
    basePath: '',
    path: '',
    pathToRegexp: {},
    updateHistory: false,

    routerContextName: '$router',
    routeDirectiveName: 'route',
    routerDirectiveName: 'router',
    routeToDirectiveName: 'route-to',
  }, options)

  // Set private variables.
  let isEnabled = false
  const routerContext = createRouterContext(options),
    routeDirective = createRouteDirective(options),
    routerDirective = createRouterDirective(options),
    routeToDirective = createRouteToDirective(options)

  const onEnable = (
  ) => {
    // Add contexts and directives.
    library.addContexts(0, routerContext)
    library.addDirectives(
      -1,
      routeDirective,
      routerDirective,
      routeToDirective,
    )
  }
  const onDisable = (
  ) => {
    // Remove contexts and directives.
    library.removeContexts(routerContext)
    library.removeDirectives(
      routeDirective,
      routerDirective,
      routeToDirective,
    )
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
