// Import symbols.
import { REFERENCES, REFERENCES_CACHE } from '../symbols.js'

export default {
  name: '$references',

  create: (
    component,
    attribute,
    update, {
      RevocableProxy,
    },
  ) => {
    // Exit early if no references exist.
    if (!component[REFERENCES]) {
      return {
        key: '$references',
        value: [],
      }
    }

    // Generate references cache.
    let cache = component[REFERENCES_CACHE]
    if (!cache) {
      // Get references from component.
      const references = component[REFERENCES]
      const attributeIds = Object.getOwnPropertySymbols(references)

      // Convert references to a named object.
      cache = {}
      for (const id of attributeIds) {
        const { element, name } = references[id]
        cache[name] = element
      }
      component[REFERENCES_CACHE] = cache
    }

    // Create revocable proxy.
    const revocable = RevocableProxy(cache, {
      get: (
        target,
        propertyKey,
        receiver,
      ) => {
        // Mark references as accessed.
        attribute.accessed(component.getId(), '$references.' + propertyKey)

        // Return reference.
        return Reflect.get(target, propertyKey, receiver)
      },
    })

    // Return references proxy.
    return {
      value: revocable.proxy,

      destroy: (
      ) => {
        revocable.revoke()
      },
    }
  },
}
