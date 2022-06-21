// Import contexts.
import contextRouter from './contexts/router.js'

// Import directives.
import createDirectiveRouter from './factories/directives/router.js'
import directiveRoute from './directives/route.js'
import directiveRouteTo from './directives/routeTo.js'

// Import utilities.
import { deepAssign } from '@doars/common/src/utilities/Object.js'

export default class DoarsRouter {
  /**
   * Create plugin instance.
   * @param {Doars} library Doars instance to add onto.
   * @param {Object} options The plugin options.
   */
  constructor(library, options = null) {
    // Clone options.
    options = deepAssign({}, options)

    // Store directives.
    let directiveRouter

    // Enable plugin when library is enabling.
    library.addEventListener('enabling', () => {
      // Add contexts and directives.
      library.addContexts(0, contextRouter)
      directiveRouter = createDirectiveRouter(options)
      library.addDirectives(-1, directiveRouter, directiveRoute, directiveRouteTo)
    })

    // Disable plugin when library is disabling.
    library.addEventListener('disabling', () => {
      // Remove contexts and directives.
      library.removeContexts(contextRouter)
      library.removeDirectives(directiveRouter, directiveRoute, directiveRouteTo)
      directiveRouter = null
    })
  }
}
