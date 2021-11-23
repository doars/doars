import { isPromise } from '../utils/PromiseUtils.js'

export default {
  name: 'text',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (text) => {
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
