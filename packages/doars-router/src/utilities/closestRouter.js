// Import symbols.
import { ROUTER } from '../symbols.js'
import Router from '../Router.js'

/**
 * Get closest router in hierarchy.
 * @param {HTMLElement} element Element to start searching from.
 * @returns {Router | undefined} Closest router.
 */
const closestRouter = (
  element,
) => {
  if (element.parentElement) {
    element = element.parentElement

    if (element[ROUTER]) {
      /** @type {Router} */
      return element[ROUTER]
    }

    return closestRouter(element)
  }
}

export default closestRouter
