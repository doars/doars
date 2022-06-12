// Import polyfill.
import RevocableProxy from '@doars/common/src/polyfills/RevocableProxy.js'

// Import symbol.
import { ROUTER } from '../symbols'

// Import utils.
import { closestRouter } from '../.js'

export default {
  name: '$router',

  create: (component, attribute) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    let router = null
    const revocable = RevocableProxy({}, {
      get: (target, propertyKey, receiver) => {
        // Get closest router from hierarchy.
        if (router === null) {
          if (element[ROUTER]) {
            router = element[ROUTER]
          } else {
            router = closestRouter(element)
          }

          // Set router to false so we don't look twice.
          if (!router) {
            router = false
          }
        }

        // Mark as router accessed.
        attribute.accessed(router.getId(), '')

        if (!router) {
          return
        }

        // Return router property.
        return Reflect.get(router, propertyKey, receiver)
      },
    })

    return {
      value: revocable.proxy,

      destroy: () => {
        revocable.revoke()
      },
    }
  },
}
