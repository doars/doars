// Import utilities.
import { decode } from '@doars/common/src/utilities/Html.js'
import { isPromise } from '@doars/common/src/utilities/Promise.js'

export default {
  name: 'html',

  update: (
    component,
    attribute, {
      processExpression,
    },
  ) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (
      html,
    ) => {
      // Decode string.
      if (modifiers.decode && typeof (html) === 'string') {
        html = decode(html)
      }

      // Clone and set html as only child for HTMLElements.
      if (html instanceof HTMLElement) {
        for (const child of element.children) {
          child.remove()
        }

        element.appendChild(html.cloneNode(true))
        return
      }

      // Set html via inner html for strings.
      if (typeof (html) === 'string') {
        if (modifiers.outer) {
          if (element.outerHTML !== html) {
            element.outerHTML = html
          }
        } else {
          if (element.innerHTML !== html) {
            element.innerHTML = html
          }
        }
        return
      }

      console.error('Doars/directives/html: Unknown type returned to directive!')
    }

    // Execute value and retrieve result.
    const result = processExpression(component, attribute, attribute.getValue())

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
}
