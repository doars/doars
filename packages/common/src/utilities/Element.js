/**
 * Convert string to HTML element.
 * @param {String} string Element contents.
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
 * Inserts an element after the reference element opposite of insertBefore and more reliable then ChildNode.after()
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
 * Check whether two nodes are the same.
 * @param {HTMElement} a A node.
 * @param {HTMElement} b Another node.
 * @returns {Boolean} Whether the nodes are the same.
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
 * Iterate over all descendants of a given node.
 * @param {HTMLElement} element Element to walk over.
 * @param {Function} filter Filter function, return false to skip element.
 * @returns {Function} Iterator function. Call until a non-truthy value is returned.
 */
export const walk = (
  element,
  filter,
) => {
  let index = -1
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
