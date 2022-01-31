// Import utils.
import { isPromise } from '../utils/PromiseUtils.js'

export default {
  name: 'show',

  update: (component, attribute, { executeExpression, transitionIn, transitionOut }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    const set = () => {
      // Get stored data.
      const data = attribute.getData()

      // Cancel previous transition.
      if (data.transition) {
        data.transition()
      }

      // Assign display based on truthiness of expression result.
      let transition
      if (data.result) {
        element.style.display = null
        transition = transitionIn(component, element)
      } else {
        transition = transitionOut(component, element, () => {
          element.style.display = 'none'
        })
      }

      // Store new transition.
      attribute.setData(
        Object.assign({}, data, {
          transition: transition,
        })
      )
    }

    // Execute attribute value.
    const result = executeExpression(component, attribute, attribute.getValue())

    // Get stored data.
    const data = attribute.getData()

    // Handle promises.
    if (isPromise(result)) {
      // Store results.
      attribute.setData(
        Object.assign({}, data, {
          result: result,
        })
      )

      Promise.resolve(result)
        .then((result) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData().result !== result) {
            return
          }

          set(result)
        })
    } else if (!data || data.result !== result) {
      // Store results.
      attribute.setData(
        Object.assign({}, data, {
          result: result,
        })
      )

      set()
    }
  },
}
