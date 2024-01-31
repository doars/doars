// Import utilities.
import { isPromise } from '@doars/common/src/utilities/Promise.js'
import { readdScripts } from '@doars/common/src/utilities/Script.js'
import {
  transitionIn,
  transitionOut,
} from '@doars/common/src/utilities/Transition.js'

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the if directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  allowInlineScript,
  ifDirectiveName,
}) => ({
  name: ifDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct component and attribute.
    const libraryOptions = component.getLibrary().getOptions()
    const directive = attribute.getDirective()
    const modifiers = attribute.getModifiers()
    const template = attribute.getElement()

    // Check if placed on a template tag.
    if (template.tagName !== 'TEMPLATE') {
      console.warn('Doars: "' + directive + '" must be placed on a `<template>`.')
      return
    }

    // Check if it only has one child.
    if (template.childCount > 1) {
      console.warn('Doars: "' + directive + '" must have one child.')
      return
    }

    const set = (
      result,
    ) => {
      // Get stored data.
      const data = attribute.getData()

      // Get existing reference element.
      let element = data.element
      let transition = data.transition

      if (!result) {
        // If the element exists then transition out and remove the element.
        if (element) {
          // FIX: Will this not re-animate the element out, or break because the element does not exist since removing the transition. Perhaps track whether it is a transition in or transition out.

          // Cancel previous transition.
          if (transition) {
            transition()
          }

          transition = transitionOut(libraryOptions, element, () => {
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
        template.insertAdjacentElement('afterend', element)
        // Get HTMLElement reference instead of DocumentFragment.
        element = template.nextElementSibling
        if (allowInlineScript || modifiers.script) {
          readdScripts(element)
        }

        // Transition element in.
        transition = transitionIn(libraryOptions, element)
      }

      // Store results.
      attribute.setData(
        Object.assign({}, data, {
          element,
          transition,
        }),
      )
    }

    // Execute expression.
    const result = processExpression(
      component,
      attribute,
      attribute.getValue(),
    )

    // Get stored data.
    const data = attribute.getData()

    // Store results.
    attribute.setData(
      Object.assign({}, data, {
        result,
      }),
    )

    // Handle promises.
    if (isPromise(result)) {
      Promise.resolve(result)
        .then((
          result,
        ) => {
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

  destroy: (
    component,
    attribute, {
      transitionOut,
    },
  ) => {
    // Get stored data.
    const data = attribute.getData()

    // If the element exists then transition out and remove the element.
    if (data.element) {
      transitionOut(
        component.getLibrary().getOptions(),
        data.element,
        () => {
          data.element.remove()
        },
      )
    }
  },
})
