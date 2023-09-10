// Import symbols.
import { INITIALIZED } from '../symbols.js'

const destroy = (
  component,
  attribute,
) => {
  // Exit early if no listeners can be found.
  if (!attribute[INITIALIZED]) {
    return
  }

  // Deconstruct component.
  const element = component.getElement()

  // Create event name.
  const name = component.getLibrary().getOptions().prefix + '-updated'

  // Remove existing listener and delete directive data.
  element.removeEventListener(name, attribute[INITIALIZED].handler)
  delete attribute[INITIALIZED]
}

export default {
  name: 'initialized',

  update: (
    component,
    attribute, {
      processExpression,
    },
  ) => {
    // Deconstruct component.
    const element = component.getElement()

    // Deconstruct attribute.
    const value = attribute.getValue()

    // Create event name.
    const name = component.getLibrary().getOptions().prefix + '-updated'

    // Check if existing listener exists.
    if (attribute[INITIALIZED]) {
      // Exit early if listener has not changed.
      if (attribute[INITIALIZED].value === value) {
        return
      }

      // Remove existing listener so we don' listen twice.
      element.removeEventListener(name, attribute[INITIALIZED].handler)
      delete attribute[INITIALIZED]
    }

    const handler = ({ detail }) => {
      // Only execute on self.
      if (detail.element !== element) {
        return
      }

      // Execute value using a copy of the attribute since this attribute does not need to update based on what it accesses.
      processExpression(component, attribute.clone(), value, {}, {
        return: false,
      })

      // Call destroy.
      destroy(component, attribute)
    }

    // Add listener to component.
    element.addEventListener(name, handler, {
      once: true,
    })

    // Store listener data on the component.
    attribute[INITIALIZED] = {
      handler,
      value,
    }
  },

  destroy,
}
