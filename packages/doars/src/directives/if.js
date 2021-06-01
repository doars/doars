// Import symbols.
import { IF } from '../symbols.js'

// Import utils.
import { insertAfter } from '../utils/ElementUtils.js'

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
      console.warn('Doars: `if` directive must have only one child node.')
      return
    }

    // Execute expression.
    const data = executeExpression(component, attribute, attribute.getValue())

    // Get existing reference element.
    let element = template[IF]

    if (!data) {
      // If the element exists then transition out and remove the element.
      if (element) {
        transitionOut(component, element, () => {
          element.remove()
        })
      }

      // Exit early.
      return
    }

    // If the reference does not exist create the element.
    if (!element) {
      // Create new element from template.
      element = document.importNode(template.content, true)
      // Add element after the template element.
      insertAfter(template, element)
      // Get HTMLElement reference instead of DocumentFragment.
      template[IF] = element = template.nextElementSibling

      // Transition element in.
      transitionIn(component, element)
    }
  },

  destroy: (component, attribute, { transitionOut }) => {
    // Deconstruct attribute.
    const template = attribute.getElement()

    // Get element from template.
    const element = template[IF]

    // If the element exists then transition out and remove the element.
    if (element) {
      transitionOut(component, element, () => {
        element.remove()
        template[IF] = undefined
      })
    }
  },
}
