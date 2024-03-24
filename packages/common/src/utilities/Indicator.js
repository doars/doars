import {
  transitionIn,
  transitionOut,
} from './Transition.js'

/**
 * @typedef {import('@doars/doars/src/Attribute.js').default} Attribute
 * @typedef {import('@doars/doars/src/Component.js').default} Component
 * @typedef {import('@doars/doars/src/Directive.js').ProcessExpression} ProcessExpression
 */

/**
 * Hides the indicator.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @returns {void}
 */
export const hideIndicator = (
  component,
  attribute,
) => {
  // Check if a indicator exists.
  if (!attribute.indicator) {
    return
  }
  // Check if not already transitioning out.
  if (attribute.indicator.indicatorTransitionOut) {
    return
  }
  // Check if a indicator element exists.
  if (!attribute.indicator.indicatorElement) {
    return
  }

  const libraryOptions = component.getLibrary().getOptions()

  // Transition element in.
  const indicatorElement = attribute.indicator.indicatorElement
  attribute.indicator.indicatorTransitionIn =
    transitionOut(libraryOptions, indicatorElement, () => {
      if (indicatorElement) {
        indicatorElement.remove()
      }
    })
}

/**
 * Shows the indicator.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {ProcessExpression} processExpression Function to process an expression with.
 * @returns {void}
 */
export const showIndicator = (
  component,
  attribute,
  processExpression,
) => {
  const libraryOptions = component.getLibrary().getOptions()
  const element = attribute.getElement()
  const directive = attribute.getDirective()

  const attributeName = libraryOptions.prefix + '-' + directive + '-' + libraryOptions.indicatorDirectiveName
  if (!element.hasAttribute(attributeName)) {
    return
  }
  let indicatorTemplate = null
  if (libraryOptions.indicatorDirectiveEvaluate) {
    indicatorTemplate = processExpression(
      component,
      attribute,
      element.getAttribute(attributeName),
    )
  } else {
    indicatorTemplate = element.getAttribute(attributeName)
  }
  if (!indicatorTemplate) {
    return
  }
  if (typeof (indicatorTemplate) === 'string') {
    indicatorTemplate = element.querySelector(indicatorTemplate)
    if (!indicatorTemplate) {
      return
    }
  }

  // Check if placed on a template tag.
  if (indicatorTemplate.tagName !== 'TEMPLATE') {
    console.warn('Doars: `' + attributeName + '` must be placed on a `<template>`.')
    return
  }
  if (indicatorTemplate.childCount > 1) {
    console.warn('Doars: `' + attributeName + '` must have one child.')
    return
  }

  // Cancel current transition.
  if (attribute.indicator) {
    if (attribute.indicator.indicatorTransitionOut) {
      attribute.indicator.indicatorTransitionOut()
      attribute.indicator.indicatorTransitionOut = null
    } else if (attribute.indicator.indicatorElement) {
      return
    }
  }

  // Create new element from template.
  const indicatorElement = document.importNode(indicatorTemplate.content, true).firstElementChild
  // Add element after the template element.
  indicatorTemplate.insertAdjacentElement('afterend', indicatorElement)
  attribute.indicator = {
    indicatorElement,
    // Transition element in.
    indicatorTransitionIn: transitionIn(libraryOptions, indicatorElement),
  }
}

export default {
  hideIndicator,
  showIndicator,
}
