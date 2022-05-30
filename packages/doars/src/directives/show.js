// Import utils.
import { isPromise } from '@doars/utils/src/PromiseUtils.js'

export default {
  name: 'show',

  update: (component, attribute, { processExpression, transitionIn, transitionOut }) => {
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
    const result = processExpression(component, attribute, attribute.getValue())

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
        .then((resultResolved) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData().result !== result) {
            return
          }

          set(resultResolved)
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
