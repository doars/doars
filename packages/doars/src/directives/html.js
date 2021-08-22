import { decode } from '../utils/HtmlUtils.js'

export default {
  name: 'html',

  update: (component, attribute, { executeExpression, morphTree }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    // Execute value and retrieve results.
    let html = executeExpression(component, attribute, attribute.getValue())

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
  },
}
