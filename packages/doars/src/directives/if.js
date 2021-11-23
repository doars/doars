// Import utils.
import { insertAfter } from '../utils/ElementUtils.js'
import { isPromise } from '../utils/PromiseUtils.js'

export default {
  name: 'if',

  update: (component, attribute, { executeExpression, transitionIn, transitionOut }) => {
    // Deconstruct attribute.
    const template = attribute.getElement()

    // Check if placed on a template tag.
    if (template.tagName !== 'TEMPLATE') {
      console.warn('Doars: `if` directive must be placed on a `<template>` tag.')
      return
    }

    // Check if it only has one child.
    if (template.childCount > 1) {
      console.warn('Doars: `if` directive must have a single child node.')
      return
    }

    const set = (result) => {
      // Get stored data.
      const data = attribute.getData()

      // Get existing reference element.
      let element = data.element
      let transition = data.transition

      if (!result) {
        // If the element exists then transition out and remove the element.
        if (element) {
          // Cancel previous transition.
          if (transition) {
            transition()
          }

          transition = transitionOut(component, element, () => {
            element.remove()
          })
        }
      } else if (!element) {
        // If the reference does not exist create the element.

        // Cancel previous transition.
        if (transition) {
          transition()
        }

        // Create new element from template.
        element = document.importNode(template.content, true)
        // Add element after the template element.
        insertAfter(template, element)
        // Get HTMLElement reference instead of DocumentFragment.
        element = template.nextElementSibling

        // Transition element in.
        transition = transitionIn(component, element)
      }

      // Store results.
      attribute.setData(
        Object.assign(data, {
          element: element,
          transition: transition,
        })
      )
    }

    // Execute expression.
    const result = executeExpression(component, attribute, attribute.getValue())

    // Get stored data.
    const data = attribute.getData()

    // Store results.
    attribute.setData(
      Object.assign(data, {
        result: result,
      })
    )

    // Handle promises.
    if (isPromise(result)) {
      Promise.resolve(result)
        .then((result) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData().result !== result) {
            return
          }

          set(result)
        })
    } else {
      set(result)
    }
  },

  destroy: (component, attribute, { transitionOut }) => {
    // Get stored data.
    const data = attribute.getData()

    // If the element exists then transition out and remove the element.
    if (data.element) {
      transitionOut(component, data.element, () => {
        data.element.remove()
      })
    }
  },
}
