// Import utils.
import { setAttribute, setAttributes } from '../utils/AttributeUtils.js'
import { isPromise } from '../utils/PromiseUtils.js'
import { parseSelector } from '../utils/StringUtils.js'

export default {
  name: 'attribute',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (value) => {
      if (modifiers.selector) {
        if (typeof (value) !== 'string') {
          console.error('Doars: Value returned to attribute directive must be a string if the selector modifier is set.')
          return
        }
        value = parseSelector(value)

        setAttributes(element, value)
        return
      }

      if (Array.isArray(value)) {
        console.error('Doars: Value returned to attribute directive can not be of type array.')
        return
      }

      // Set attributes on element.
      if (typeof (value) === 'object') {
        setAttributes(element, value)
        return
      }

      // Deconstruct attribute.
      const key = attribute.getKeyRaw()

      // Set attribute on element at key.
      setAttribute(element, key, value)
    }

    // Execute attribute value.
    const result = executeExpression(component, attribute, attribute.getValue())

    // Store results.
    attribute.setData(result)

    // Handle promises.
    if (isPromise(result)) {
      Promise.resolve(result)
        .then((result) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData() !== result) {
            return
          }

          set(result)
        })
    } else {
      set(result)
    }
  },
}
