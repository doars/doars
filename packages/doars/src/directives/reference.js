// Import symbols.
import { REFERENCES, REFERENCES_CACHE } from '../symbols.js'

const destroy = (component, attribute) => {
  // Exit early if not set.
  if (!component[REFERENCES]) {
    return
  }

  // Deconstruct attribute.
  const attributeId = attribute.getId()

  // Exit early if not the same attribute.
  if (!component[REFERENCES][attributeId]) {
    return
  }

  // Deconstruct component.
  const library = component.getLibrary()
  const componentId = component.getId()

  // Deconstruct attribute.
  const value = attribute.getValue().trim()

  // Remove reference from object.
  delete component[REFERENCES][attributeId]

  // Remove context cache.
  delete component[REFERENCES_CACHE]

  // Remove object if it is empty now.
  if (Object.keys(component[REFERENCES]).length === 0) {
    delete component[REFERENCES]
  }

  // Trigger references update.
  library.update([{ id: componentId, path: '$references.' + value }])
}

export default {
  name: 'reference',

  update: (component, attribute) => {
    // Deconstruct attribute.
    const value = attribute.getValue().trim()

    // Check if value is a valid variable name.
    if (!/^[_$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(value)) {
      destroy(component, attribute)
      console.warn('Doars: `reference` directive\'s value not a valid variable name: "' + value + '".')
      return
    }

    // Deconstruct component.
    const library = component.getLibrary()
    const componentId = component.getId()

    // Deconstruct attribute.
    const element = attribute.getElement()
    const attributeId = attribute.getId()

    // Check if references object exists.
    if (!component[REFERENCES]) {
      component[REFERENCES] = {}
    }

    // Store reference.
    component[REFERENCES][attributeId] = {
      element,
      name: value,
    }

    // Remove context cache.
    delete component[REFERENCES_CACHE]

    // Trigger references update.
    library.update([{ id: componentId, path: '$references.' + value }])
  },

  destroy,
}
