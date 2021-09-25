// Import utils.
import { decode } from '../utils/HtmlUtils.js'
import { isPromise } from '../utils/PromiseUtils.js'

export default {
  name: 'html',

  update: (component, attribute, { executeExpression, morphTree }) => {
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
        morphTree(element.children[0], html)
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
