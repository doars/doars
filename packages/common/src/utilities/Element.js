/**
 * Convert string to HTML element.
 * @param {string} string Element contents.
 * @returns {HTMLElement} HTML element part of a document fragment.
 */
export const fromString = (
  string,
) => {
  const stringStart = string.substring(0, 15).toLowerCase()
  const isDocument = (
    stringStart.startsWith('<!doctype html>') ||
    stringStart.startsWith('<html>')
  )
  if (isDocument) {
    const html = document.createElement('html')
    html.innerHTML = string
    return html
  }

  const template = document.createElement('template')
  template.innerHTML = string
  return template.content.childNodes[0]
}

/**
 * Inserts an element after the reference element opposite of insertBefore and more reliable then ChildNode.after().
 * @param {HTMLElement} reference Node to insert after.
 * @param {Node} node Node to insert.
 */
export const insertAfter = (
  reference,
  node,
) => {
  if (reference.nextSibling) {
    reference.parentNode.insertBefore(node, reference.nextSibling)
  } else {
    reference.parentNode.appendChild(node)
  }
}

/**
 * Inserts an element before the reference element,
 * @param {HTMLElement} reference Node to insert before.
 * @param {Node} node Node to insert.
 */
export const insertBefore = (
  reference,
  node,
) => {
  reference.parentNode.insertBefore(reference, node)
}

/**
 * Check whether two nodes are the same.
 * @param {HTMLElement} a A node.
 * @param {HTMLElement} b Another node.
 * @returns {boolean} Whether the nodes are the same.
 */
export const isSame = (
  a,
  b,
) => {
  if (a.isSameNode && a.isSameNode(b)) {
    return true
  }

  if (a.type === 3) { // Text node.
    return a.nodeValue === b.nodeValue
  }

  if (a.tagName === b.tagName) {
    return true
  }

  return false
}

/**
 * @callback WalkIterate Returns a new child element or null when all items have been iterated on.
 * @returns {HTMLElement|null}
 */

/**
 * @callback WalkFilter Filter function that takes in an element and return true if the element needs to be walked and false when it needs to be skipped.
 * @param {HTMLElement} element Element to decide on.
 * @returns {boolean}
 */

/**
 * Iterate over all descendants of a given node.
 * @param {HTMLElement} element Element to walk over.
 * @param {WalkFilter} filter Filter function, return false to skip element.
 * @returns {WalkIterate} Iterator function. Call until a non-truthy value is returned.
 */
export const walk = (
  element,
  filter,
) => {
  let index = -1
  /** @type {null|WalkIterate} */
  let iterator = null
  return () => {
    // First go over iterator.
    if (index >= 0 && iterator) {
      const child = iterator()
      if (child) {
        return child
      }
    }

    // Get next child that passes the filter.
    let child = null
    do {
      index++
      if (index >= element.childElementCount) {
        return null
      }

      child = element.children[index]
    } while (!filter(child))

    // Setup iterator for child.
    if (child.childElementCount) {
      iterator = walk(child, filter)
    }

    // Return the child.
    return child
  }
}

export default {
  fromString,
  insertAfter,
  isSame,
  walk,
}
