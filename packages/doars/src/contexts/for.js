// Import symbols.
import { FOR } from '../symbols.js'

export default {
  deconstruct: true,

  name: '$for',

  create: (component, attribute, update, { RevocableProxy }) => {
    // Exit early in parent contexts.
    if (component !== attribute.getComponent()) {
      return
    }

    // Deconstruct attribute.
    let element = attribute.getElement()

    // Walk up the tree until the component's root element is found.
    const componentElement = component.getElement(), items = [], target = {}
    while (element && !element.isSameNode(componentElement)) {
      // Check if element has for symbol.
      const data = element[FOR]
      if (data) {
        items.push(data)

        for (const key in data.variables) {
          target[key] = data.variables[key]
        }
      }

      // Go up the document tree.
      element = element.parentNode
    }

    if (items.length === 0) {
      return
    }

    // Create revocable proxy.
    const revocable = RevocableProxy(target, {
      get: (target, key) => {
        for (const item of items) {
          if (key in item.variables) {
            // Mark as accessed for data.
            attribute.accessed(item.id, '$for')

            // Return value at key.
            return item.variables[key]
          }
        }
      },
    })

    // Set keys and return values.
    return {
      value: revocable.proxy,

      destroy: () => {
        revocable.revoke()
      },
    }
  },
}
