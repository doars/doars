import { walk } from './Element.js'

/**
 * Re-adds a script to the document in order to trigger it again.
 * @param {HTMLElement} element Script to re-add to the DOM.
 * @returns {void}
 */
const _readdScript = (
  element,
) => {
  // Check if element is a script without a source.
  if (
    element.tagName !== 'SCRIPT' ||
    element.hasAttribute('src')
  ) {
    return false
  }

  // Set up new script with same content.
  const newScript = document.createElement('script')
  newScript.innerText = element.innerText

  // Replace script in the document.
  element.parentNode.insertBefore(
    newScript,
    element,
  )
  element.remove()
  return true
}

/**
 * Checks the elements for scripts and re-adds these to the DOM.
 * @param  {...HTMLElement} elements Elements to check for scripts.
 * @returns {void}
 */
export const readdScripts = (
  ...elements
) => {
  for (const element of elements) {
    // Try to re-add element in case it is a script.
    if (!_readdScript(element)) {
      // Otherwise check its children.
      const iterate = walk(element)
      let maybeScript = null
      while (maybeScript = iterate()) {
        _readdScript(maybeScript)
      }
    }
  }
}

export default {
  readdScripts,
}
