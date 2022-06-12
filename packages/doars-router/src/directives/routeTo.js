// Import symbols.
import { ROUTE_TO } from '../symbols.js'

// Import utils.
import { closestRouter } from '../.js'

const CLICK = 'click'

export default {
  name: 'route-to',

  update: (component, attribute) => {
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()
    const value = attribute.getValue()

    // Check for existing data.
    if (attribute[ROUTE_TO]) {
      // Exit early if listener has not changed.
      if (attribute[ROUTE_TO].value === value) {
        return
      }

      // Remove existing listeners so we don't listen twice.
      attribute[ROUTE_TO].target.removeEventListener(CLICK, attribute[ROUTE_TO].handler)
    }

    const handler = (event) => {
      if (modifiers.self && event.target !== element) {
        return
      }

      if (modifiers.prevent) {
        event.preventDefault()
      }
      if (modifiers.stop) {
        event.stopPropagation()
      }

      const router = closestRouter(element)
      if (!router) {
        return
      }

      router.setPath(value)
    }

    // Listen to click and keyboard events.
    element.addEventListener(CLICK, handler)

    // Store listener data on the component.
    attribute[ROUTE_TO] = {
      handler: handler,
      value: value,
    }
  },

  destroy: (component, attribute) => {
    if (!attribute[ROUTE_TO]) {
      return
    }

    const element = attribute.getElement()

    element.removeEventListener(CLICK, attribute[ROUTE_TO].handler)

    delete attribute[ROUTE_TO]
  },
}
