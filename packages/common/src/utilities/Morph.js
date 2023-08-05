// Based on nanomorph, v5.4.3, https://github.com/choojs/nanomorph#readme) and morphdom, https://github.com/patrick-steele-idem/morphdom/tree/master#morphdom.

// Import utilities.
import { copyAttributes } from './Attribute.js'
import {
  fromString as elementFromString,
  isSame as elementIsSame
} from './Element.js'

/**
 * Diff elements and apply the resulting patch to the existing node.
 * @param {HTMLElement} existingNode Existing node to update.
 * @param {HTMLElement} newNode Element to update existing node with.
*/
export const morphNode = (
  existingNode,
  newNode,
) => {
  const nodeType = newNode.nodeType
  const nodeName = newNode.nodeName

  // Element node.
  if (nodeType === 1) {
    copyAttributes(existingNode, newNode)
  }

  // Text node or comment node.
  if (nodeType === 3 || nodeType === 8) {
    if (existingNode.nodeValue !== newNode.nodeValue) {
      existingNode.nodeValue = newNode.nodeValue
    }
  }

  // Some DOM nodes are weird.
  // https://github.com/patrick-steele-idem/morphdom/blob/master/src/specialElHandlers.js
  if (nodeName === 'INPUT') {
    _updateInput(existingNode, newNode)
  } else if (nodeName === 'OPTION') {
    _updateAttribute(existingNode, newNode, 'selected')
  } else if (nodeName === 'TEXTAREA') {
    _updateTextarea(existingNode, newNode)
  }
}

/**
 * Morph the existing element tree into the given tree.
 * @param {HTMLElement} existingTree The existing tree to convert.
 * @param {HTMLElement} newTree The tree to change to.
 * @param {Object} options Options to modify the morphing behaviour.
 * @returns {HTMLElement} New tree root element.
 */
export const morphTree = (
  existingTree,
  newTree,
  options,
) => {
  if (typeof (existingTree) !== 'object') {
    throw new Error('Existing tree should be an object.')
  }

  if (typeof (newTree) === 'string') {
    newTree = elementFromString(newTree)
  } else if (typeof (newTree) !== 'object') {
    throw new Error('New tree should be an object.')
  }

  // Check if outer or inner html should be updated. Always update children only if root node is a document fragment.
  if ((options && options.childrenOnly) || newTree.nodeType === 11) {
    _updateChildren(existingTree, newTree)
    return existingTree
  }

  return _updateTree(existingTree, newTree)
}

/**
 * Update attributes on input element.
 * @param {HTMLElement} existingNode Existing node to update.
 * @param {HTMLElement} newNode Element to update existing node with.
 */
const _updateInput = (
  existingNode,
  newNode,
) => {
  // The "value" attribute is special for the <input> element since it sets the
  // initial value. Changing the "value" attribute without changing the "value"
  // property will have no effect since it is only used to the set the initial
  // value. Similar for the "checked" attribute, and "disabled".

  const newValue = newNode.value
  const existingValue = existingNode.value

  _updateAttribute(existingNode, newNode, 'checked')
  _updateAttribute(existingNode, newNode, 'disabled')

  // The "indeterminate" property can not be set using an HTML attribute.
  // See https://developer.mozilla.org/en-US/docs/Web/HTML/Element/input/checkbox
  if (existingNode.indeterminate !== newNode.indeterminate) {
    existingNode.indeterminate = newNode.indeterminate
  }

  // Persist file value since file inputs can not be changed programmatically
  if (existingNode.type === 'file') {
    return
  }

  if (existingValue !== newValue) {
    existingNode.setAttribute('value', newValue)
    existingNode.value = newValue
  }

  if (newValue === 'null') {
    existingNode.value = ''
    existingNode.removeAttribute('value')
  }

  if (!newNode.hasAttributeNS(null, 'value')) {
    existingNode.removeAttribute('value')
  } else if (existingNode.type === 'range') {
    // this is so elements like slider move their UI thingy
    existingNode.value = newValue
  }
}

/**
 * Update attributes on textarea element.
 * @param {HTMLElement} existingNode Existing node to update.
 * @param {HTMLElement} newNode Element to update existing node with.
 */
const _updateTextarea = (
  existingNode,
  newNode,
) => {
  const newValue = newNode.value
  if (existingNode.value !== newValue) {
    existingNode.value = newValue
  }

  if (existingNode.firstChild && existingNode.firstChild.nodeValue !== newValue) {
    existingNode.firstChild.nodeValue = newValue
  }
}

/**
 * Update attributes on element.
 * @param {HTMLElement} existingNode Existing node to update.
 * @param {HTMLElement} newNode Element to update existing node with.
 */
const _updateAttribute = (
  existingNode,
  newNode,
  name,
) => {
  if (existingNode[name] !== newNode[name]) {
    existingNode[name] = newNode[name]
    if (newNode[name]) {
      existingNode.setAttribute(name, '')
    } else {
      existingNode.removeAttribute(name)
    }
  }
}

/**
 * Morph the existing element tree into the given tree.
 * @param {HTMLElement} existingTree The existing tree to convert.
 * @param {HTMLElement} newTree The tree to change to.
 * @returns {HTMLElement} New tree root element.
 */
const _updateTree = (
  existingTree,
  newTree,
) => {
  if (!existingTree) {
    return newTree
  }

  if (!newTree) {
    return null
  }

  if (existingTree.isSameNode && existingTree.isSameNode(newTree)) {
    return existingTree
  }

  if (existingTree.tagName !== newTree.tagName) {
    return newTree
  }

  morphNode(existingTree, newTree)
  _updateChildren(existingTree, newTree)

  return existingTree
}

/**
 * Change the existing element's children into the given element's children.
 * @param {HTMLElement} existingNode The existing node who's children to update.
 * @param {HTMLElement} newNode The existing node who's children to change to.
 */
const _updateChildren = (
  existingNode,
  newNode,
) => {
  let existingChild, newChild, morphed, existingMatch

  // The offset is only ever increased, and used for [i - offset] in the loop
  let offset = 0

  for (let i = 0; ; i++) {
    existingChild = existingNode.childNodes[i]
    newChild = newNode.childNodes[i - offset]

    // Both nodes are empty, do nothing
    if (!existingChild && !newChild) {
      break

      // There is no new child, remove old
    } else if (!newChild) {
      existingNode.removeChild(existingChild)
      i--

      // There is no old child, add new
    } else if (!existingChild) {
      existingNode.appendChild(newChild)
      offset++

      // Both nodes are the same, morph
    } else if (elementIsSame(existingChild, newChild)) {
      morphed = _updateTree(existingChild, newChild)
      if (morphed !== existingChild) {
        existingNode.replaceChild(morphed, existingChild)
        offset++
      }

      // Both nodes do not share an ID or a placeholder, try reorder
    } else {
      existingMatch = null

      // Try and find a similar node somewhere in the tree
      for (let j = i; j < existingNode.childNodes.length; j++) {
        if (elementIsSame(existingNode.childNodes[j], newChild)) {
          existingMatch = existingNode.childNodes[j]
          break
        }
      }

      // If there was a node with the same ID or placeholder in the old list
      if (existingMatch) {
        morphed = _updateTree(existingMatch, newChild)
        if (morphed !== existingMatch) {
          offset++
        }
        existingNode.insertBefore(morphed, existingChild)

        // It is safe to morph two nodes in-place if neither has an ID
      } else if (!newChild.id && !existingChild.id) {
        morphed = _updateTree(existingChild, newChild)
        if (morphed !== existingChild) {
          existingNode.replaceChild(morphed, existingChild)
          offset++
        }

        // Insert the node at the index if we could not morph or find a matching node
      } else {
        existingNode.insertBefore(newChild, existingChild)
        offset++
      }
    }
  }
}

export default {
  morphNode,
  morphTree,
}
