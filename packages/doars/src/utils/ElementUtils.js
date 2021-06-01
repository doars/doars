/**
 * Inserts an element after the reference element opposite of insertBefore and more reliable then ChildNode.after()
 * @param {HTMLElement} reference Node to insert after.
 * @param {Node} node Node to insert.
 */
export const insertAfter = (reference, node) => {
  if (reference.nextSibling) {
    reference.parentNode.insertBefore(node, reference.nextSibling)
  } else {
    reference.parentNode.appendChild(node)
  }
}

/**
 * Iterate over all descendants of a given node.
 * @param {HTMLElement} element Element to walk over.
 * @param {Function} filter Filter function, return false to skip element.
 * @returns {Function} Iterator function. Call until a non-truthy value is returned.
 */
export const walk = (element, filter) => {
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
  insertAfter: insertAfter,
  walk: walk,
}
