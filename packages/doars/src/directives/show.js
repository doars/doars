// Import utilities.
import { isPromise } from '@doars/common/src/utilities/Promise.js'
import {
  transitionIn,
  transitionOut,
} from '@doars/common/src/utilities/Transition.js'

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the show directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  showDirectiveName,
}) => ({
  name: showDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct component and attribute.
    const libraryOptions = component.getLibrary().getOptions()
    const element = attribute.getElement()

    const set = (
    ) => {
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
        transition = transitionIn(libraryOptions, element)
      } else {
        transition = transitionOut(libraryOptions, element, () => {
          element.style.display = 'none'
        })
      }

      // Store new transition.
      attribute.setData(
        Object.assign({}, data, {
          transition,
        }),
      )
    }

    // Execute attribute value.
    const result = processExpression(
      component,
      attribute,
      attribute.getValue(),
    )

    // Get stored data.
    const data = attribute.getData()

    // Handle promises.
    if (isPromise(result)) {
      // Store results.
      attribute.setData(
        Object.assign({}, data, {
          result,
        }),
      )

      Promise.resolve(result)
        .then((
          resultResolved,
        ) => {
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
          result,
        }),
      )

      set()
    }
  },
})
