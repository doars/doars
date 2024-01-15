// Import symbols.
import {
  REFERENCES,
  REFERENCES_CACHE,
} from '../symbols.js'

/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Destroys the directive.
 * @param {Component} component The component the directive is part of.
 * @param {Attribute} attribute The attribute the directive is part of.
 * @returns {undefined}
 */
const destroy = (
  component,
  attribute,
) => {
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
  const name = component[REFERENCES][attributeId].name

  // Remove reference from object.
  delete component[REFERENCES][attributeId]

  // Remove context cache.
  delete component[REFERENCES_CACHE]

  // Remove object if it is empty now.
  if (Object.keys(component[REFERENCES]).length === 0) {
    delete component[REFERENCES]
  }

  // Trigger references update.
  library.update([{
    id: componentId,
    path: '$references.' + name,
  }])
}

/**
 * Create the reference directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  referenceDirectiveName,
}) => ({
  name: referenceDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct component.
    const library = component.getLibrary()
    const componentId = component.getId()

    // Deconstruct attribute.
    const directive = attribute.getDirective()
    const element = attribute.getElement()
    const attributeId = attribute.getId()

    const {
      referenceDirectiveEvaluate,
    } = library.getOptions()

    // Process attribute name.
    let name = attribute.getValue()
    name = referenceDirectiveEvaluate
      ? processExpression(
        component,
        attribute,
        name,
      )
      : name.trim()

    // Check if value is a valid variable name.
    if (
      !name ||
      typeof (name) !== 'string' ||
      !/^[_$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(name)
    ) {
      destroy(component, attribute)
      console.warn('Doars: "' + directive + '" directive\'s value not a valid variable name: "' + name.toString() + '".')
      return
    }

    // Check if references object exists.
    if (!component[REFERENCES]) {
      component[REFERENCES] = {}
    }

    // Store reference.
    component[REFERENCES][attributeId] = {
      element,
      name,
    }

    // Remove context cache.
    delete component[REFERENCES_CACHE]

    // Trigger references update.
    library.update([{
      id: componentId,
      path: '$references.' + name,
    }])
  },

  destroy,
})
