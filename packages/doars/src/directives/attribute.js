// Import utils.
import { setAttribute, setAttributes } from '../utils/AttributeUtils.js'
import { parseSelector } from '../utils/StringUtils.js'

export default {
  name: 'attribute',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    // Execute attribute value.
    let data = executeExpression(component, attribute, attribute.getValue())

    if (modifiers.selector) {
      if (typeof (data) !== 'string') {
        console.error('Doars: Value returned to attribute directive must be a string if the selector modifier is set.')
        return
      }
      data = parseSelector(data)

      setAttributes(element, data)
      return
    }

    if (Array.isArray(data)) {
      console.error('Doars: Value returned to attribute directive can not be of type array.')
      return
    }

    // Set attributes on element.
    if (typeof (data) === 'object') {
      setAttributes(element, data)
      return
    }

    // Deconstruct attribute.
    const key = attribute.getKeyRaw()

    // Set attribute on element at key.
    setAttribute(element, key, data)
  },
}
