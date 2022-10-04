/**
 * Add attributes on an element based of an object.
 * @param {HTMLElement} element Element to add the attributes to.
 * @param {Object} data Attribute data to add.
 */
export const addAttributes = (element, data) => {
  for (const name in data) {
    if (name === 'class') {
      // Add classes to classlist.
      for (const className of data.class) {
        element.classList.add(className)
      }
      continue
    }

    // Set attribute.
    element.setAttribute(name, data[name])
  }
}

/**
 * Copy all attributes onto one node from another.
 * @param {HTMLElement} existingNode Node to copy to.
 * @param {HTMLElement} newNode Node to copy from.
 */
export const copyAttributes = (existingNode, newNode) => {
  const existingAttributes = existingNode.attributes
  const newAttributes = newNode.attributes
  let attributeNamespaceURI = null
  let attributeValue = null
  let fromValue = null
  let attributeName = null
  let attribute = null

  for (let i = newAttributes.length - 1; i >= 0; --i) {
    attribute = newAttributes[i]
    attributeName = attribute.name
    attributeNamespaceURI = attribute.namespaceURI
    attributeValue = attribute.value
    if (attributeNamespaceURI) {
      attributeName = attribute.localName || attributeName
      fromValue = existingNode.getAttributeNS(attributeNamespaceURI, attributeName)
      if (fromValue !== attributeValue) {
        existingNode.setAttributeNS(attributeNamespaceURI, attributeName, attributeValue)
      }
    } else {
      if (!existingNode.hasAttribute(attributeName)) {
        existingNode.setAttribute(attributeName, attributeValue)
      } else {
        fromValue = existingNode.getAttribute(attributeName)
        if (fromValue !== attributeValue) {
          // apparently values are always cast to strings, ah well
          if (attributeValue === 'null' || attributeValue === 'undefined') {
            existingNode.removeAttribute(attributeName)
          } else {
            existingNode.setAttribute(attributeName, attributeValue)
          }
        }
      }
    }
  }

  // Remove any extra attributes found on the original DOM element that
  // weren't found on the target element.
  for (let j = existingAttributes.length - 1; j >= 0; --j) {
    attribute = existingAttributes[j]
    if (attribute.specified !== false) {
      attributeName = attribute.name
      attributeNamespaceURI = attribute.namespaceURI

      if (attributeNamespaceURI) {
        attributeName = attribute.localName || attributeName
        if (!newNode.hasAttributeNS(attributeNamespaceURI, attributeName)) {
          existingNode.removeAttributeNS(attributeNamespaceURI, attributeName)
        }
      } else {
        if (!newNode.hasAttributeNS(null, attributeName)) {
          existingNode.removeAttribute(attributeName)
        }
      }
    }
  }
}

/**
 * Remove attributes on an element based of an object.
 * @param {HTMLElement} element Element to remove the attributes from.
 * @param {Object} data Attribute data to remove.
 */
export const removeAttributes = (element, data) => {
  for (const name in data) {
    if (name === 'class') {
      // Add classes to classlist.
      for (const className of data.class) {
        element.classList.remove(className)
      }
      continue
    }

    // Check if optional values match.
    if (data[name] && element.attributes[name] !== data[name]) {
      continue
    }

    // Remove attribute.
    element.removeAttribute(name)
  }
}

/**
 * Set data at key on element as attribute.
 * @param {HTMLElement} element Element to set attribute of.
 * @param {String} key Attribute name.
 * @param {Any} data Attribute data.
 */
export const setAttribute = (element, key, data) => {
  // Check if a special attribute key.
  if (key === 'value' && element.tagName === 'INPUT') {
    if (!data) {
      data = ''
    }

    // Exit early if nothing will change.
    if (element.getAttribute(key) === data) {
      return
    }

    // Update attribute.
    element.setAttribute(key, data)

    // Exit special cases early.
    return
  }

  // If checked attribute then set the checked property instead.
  if (key === 'checked') {
    if (element.type === 'checkbox' || element.type === 'radio') {
      element.checked = !!data
      return
    }
  }

  if (key === 'class') {
    if (Array.isArray(data)) {
      // Join values together if it is a list of classes.
      data = data.join(' ')
    } else if (typeof (data) === 'object') {
      // List keys of object as a string if the value is truthy.
      data = Object.entries(data).filter(([key, value]) => value).map(([key]) => key).join(' ')
    }
  }

  if (key === 'style') {
    if (Array.isArray(data)) {
      // Join values together if it is a list of classes.
      data = data.join(' ')
    } else if (typeof (data) === 'object') {
      // List keys of object as a string if the value is truthy.
      data = Object.entries(data).map(([key, value]) => key + ':' + value).join(';')
    }
  }

  // Update attribute on element.
  if (data === false || data === null || data === undefined) {
    element.removeAttribute(key)
  } else {
    element.setAttribute(key, data)
  }
}

/**
 * Set attributes on an element based of an object.
 * @param {HTMLElement} element Element to add the attributes to.
 * @param {Object} data Attribute data to set.
 */
export const setAttributes = (element, data) => {
  for (const name in data) {
    setAttribute(element, name, data[name])
  }
}

export default {
  addAttributes,
  copyAttributes,
  removeAttributes,
  setAttribute,
}
