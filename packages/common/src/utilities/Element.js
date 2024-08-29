/**
 * @typedef {import('@doars/doars/src/Attribute.js').default} Attribute
 * @typedef {import('@doars/doars/src/Component.js').default} Component
 * @typedef {import('@doars/doars/src/Directive.js').ProcessExpression} ProcessExpression
 */

/**
 * Convert string to HTML element.
 * @param {string} string Element contents.
 * @returns {HTMLElement} HTML element part of a document fragment.
 */
export const fromString = (
  string,
) => {
  const stringStart = string.substring(0, 15).toLowerCase()
  if (
    stringStart.startsWith('<!doctype html>') ||
    stringStart.startsWith('<html>')
  ) {
    const html = document.createElement('html')
    html.innerHTML = string
    return html
  }

  const template = document.createElement('template')
  template.innerHTML = string
  return template.content.childNodes[0]
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
  if (
    a.isSameNode &&
    a.isSameNode(b)
  ) {
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
 * Select a section of the element.
 * @param {HTMLElement|string} node Element to select from.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {ProcessExpression} processExpression Function to process an expression with.
 * @returns {HTMLElement|string|null} The selection of the node based on the select directive, if a string was entered in to the function it will also be returned as a string.
 */
export const select = (
  node,
  component,
  attribute,
  processExpression,
) => {
  const libraryOptions = component.getLibrary().getOptions()
  const element = attribute.getElement()
  const directive = attribute.getDirective()

  const attributeName = libraryOptions.prefix + '-' + directive + '-' + libraryOptions.selectFromElementDirectiveName
  if (!element.hasAttribute(attributeName)) {
    return node
  }
  let selector = null
  if (libraryOptions.selectFromElementDirectiveEvaluate) {
    selector = processExpression(
      component,
      attribute,
      element.getAttribute(attributeName),
    )
    if (typeof (selector) !== 'string') {
      console.warn('Doars: `' + attributeName + '` must return a string.')
      return null
    }
  } else {
    selector = element.getAttribute(attributeName)
  }
  if (selector) {
    const asString = typeof (node) === 'string'
    if (asString) {
      node = fromString(node)
    }

    node = node.querySelector(selector)

    if (
      asString &&
      node
    ) {
      return node.outerHTML
    }
  }
  return node
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
 * @param {HTMLElement} node Element to walk over.
 * @param {WalkFilter} filter Filter function, return false to skip element.
 * @returns {WalkIterate} Iterator function. Call until a non-truthy value is returned.
 */
export const walk = (
  node,
  filter,
) => {
  let index = -1
  /** @type {null|WalkIterate} */
  let iterator = null
  return () => {
    // First go over iterator.
    if (
      index >= 0 &&
      iterator
    ) {
      const child = iterator()
      if (child) {
        return child
      }
    }

    // Get next child that passes the filter.
    let child = null
    do {
      index++
      if (index >= node.childElementCount) {
        return null
      }

      child = node.children[index]
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
  isSame,
  select,
  walk,
}
