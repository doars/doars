// Import utilities.
import { decode } from '@doars/common/src/utilities/Html.js'
import { morphTree } from '@doars/common/src/utilities/Morph.js'
import { isPromise } from '@doars/common/src/utilities/Promise.js'
import { readdScripts } from '@doars/common/src/utilities/Script.js'

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the html directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  allowInlineScript,
  htmlDirectiveName,
}) => ({
  name: htmlDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct attribute.
    const directive = attribute.getDirective()
    const element = attribute.getElement()
    const modifiers = attribute.getModifiers()

    const set = (
      html,
    ) => {
      // Decode string.
      if (modifiers.decode) {
        html = decode(html)
      }

      // Clone and set html as only child for HTMLElements.
      if (html instanceof HTMLElement) {
        for (const child of element.children) {
          child.remove()
        }

        element.appendChild(
          html.cloneNode(true),
        )
        return
      }

      // Set html via inner html for strings.
      if (typeof (html) === 'string') {
        if (modifiers.morph) {
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
        } else if (modifiers.outer) {
          if (element.outerHTML !== html) {
            element.outerHTML = html
            if (allowInlineScript || modifiers.script) {
              readdScripts(element)
            }
          }
        } else if (element.innerHTML !== html) {
          element.innerHTML = html
          if (allowInlineScript || modifiers.script) {
            readdScripts(...element.children)
          }
        }
        return
      }

      console.error('Doars: Unknown type returned to "' + directive + '" directive.')
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
})
