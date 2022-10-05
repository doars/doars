// Import symbols.
import { COMPONENT } from '../symbols.js'

/**
 * Get closest component in hierarchy.
 * @param {HTMLElement} element Element to start searching from.
 * @returns {Component} Closest component.
 */
export const closestComponent = (element) => {
  if (!element.parentElement) {
    return
  }
  element = element.parentElement

  if (element[COMPONENT]) {
    return element[COMPONENT]
  }

  return closestComponent(element)
}

export default {
  closestComponent,
}
