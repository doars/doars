// Import utils.
import { decode } from '@doars/utils/src/HtmlUtils.js'
import { isPromise } from '@doars/utils/src/PromiseUtils.js'

export default {
  name: 'html',

  update: (component, attribute, { processExpression, morphTree }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (html) => {
      // Decode string.
      if (modifiers.decode && typeof (html) === 'string') {
        html = decode(html)
      }

      // Morph if morph modifier is set.
      if (modifiers.morph) {
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
        return
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
        if (element.innerHTML !== html) {
          element.innerHTML = html
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
        .then((resultResolved) => {
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
