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
    const data = executeExpression(component, attribute, attribute.getValue())

    // Store data for comparison later.
    attribute.setData(data)

    // Optionally handle promises and set data.
    if (isPromise(data)) {
      Promise.resolve(data)
        .then((result) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getDate() !== data) {
            return
          }

          set(result)
        })
    } else {
      set(data)
    }
  },
}
