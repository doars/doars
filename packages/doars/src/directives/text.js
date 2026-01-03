import { isPromise } from '@doars/common/src/utilities/Promise.js'

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the text directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  textDirectiveName,
}) => ({
  name: textDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (text) => {
      // Make sure it is text.
      const textType = typeof(text)
      if (textType !== 'string') {
        text = String(text)
      }

      // Assign text.
      if (modifiers.content) {
        if (element.textContent !== text) {
          element.textContent = text
        }
      } else if (element.innerText !== text) {
        element.innerText = text
      }
    }

    // Execute value and retrieve result.
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
