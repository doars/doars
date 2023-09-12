// Import utilities.
import { decode } from '@doars/common/src/utilities/Html.js'
import { isPromise } from '@doars/common/src/utilities/Promise.js'
import { morphTree } from '@doars/common/src/utilities/Morph.js'

export default {
  name: 'morph',

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

      if (modifiers.outer) {
        // Morph the element as well.
        morphTree(element, html)
      } else {
        // Ensure element only has one child.
        if (element.children.length === 0) {
          element.appendChild(document.createElement('div'))
        } else if (element.children.length > 1) {
          for (let i = element.children.length - 1; i >= 1; i--) {
            element.children[i].remove()
          }
        }

        // Morph first child to given element tree.
        const root = morphTree(element.children[0], html)
        if (!element.children[0].isSameNode(root)) {
          element.children[0].remove()
          element.appendChild(root)
        }
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
}
