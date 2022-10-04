// Import symbols.
import { ROUTER } from '../symbols.js'

/**
 * Get closest router in hierarchy.
 * @param {HTMLElement} element Element to start searching from.
 * @returns {Router} Closest router.
 */
const closestRouter = (element) => {
  if (!element.parentElement) {
    return
  }
  element = element.parentElement

  if (element[ROUTER]) {
    return element[ROUTER]
  }

  return closestRouter(element)
}

export default closestRouter
