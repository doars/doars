// Import utilities.
import { setAttribute, setAttributes } from '@doars/common/src/utilities/Attribute.js'
import { isPromise } from '@doars/common/src/utilities/Promise.js'
import { parseSelector } from '@doars/common/src/utilities/String.js'

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the attribute directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  attributeDirectiveName,
}) => ({
  name: attributeDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct attribute.
    const directive = attribute.getDirective()
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (
      value,
    ) => {
      if (modifiers.selector) {
        if (typeof (value) !== 'string') {
          console.error('Doars: Value returned to "' + directive + '" directive must be a string if the selector modifier is set.')
          return
        }
        value = parseSelector(value)

        setAttributes(element, value)
        return
      }

      // Deconstruct attribute.
      const key = attribute.getKeyRaw()

      if (!key) {
        // Set attributes on element.
        if (typeof (value) === 'object' && !Array.isArray(value)) {
          setAttributes(element, value)
        } else {
          console.error('Doars: Value returned to "' + directive + '" directive of invalid type.')
        }

        return
      }

      // Set attribute on element at key.
      setAttribute(element, key, value)
    }

    // Execute attribute value.
    const result = processExpression(
      component,
      attribute,
      attribute.getValue(),
    )

    // Store results.
    attribute.setData(result)

    // Handle promises.
    if (isPromise(result)) {
      Promise.resolve(result)
        .then((
          resultResolved,
        ) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData() !== result) {
            return
          }

          set(resultResolved)
        })
    } else {
      set(result)
    }
  },
})
