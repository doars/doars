// Import symbols.
import { COMPONENT } from '../symbols.js'

/**
 * @typedef {import('../Component.js').default} Component
 */

/**
 * Get closest component in hierarchy.
 * @param {HTMLElement} element Element to start searching from.
 * @returns {Component|undefined} Closest component.
 */
export const closestComponent = (
  element,
) => {
  if (element.parentElement) {
    element = element.parentElement

    if (element[COMPONENT]) {
      /** @type {Component} */
      return element[COMPONENT]
    }

    return closestComponent(element)
  }
}

export default {
  closestComponent,
}
