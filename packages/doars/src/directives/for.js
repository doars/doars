// Import symbols.
import { FOR } from '../symbols.js'

// Import utils.
import { insertAfter } from '../utils/ElementUtils.js'
import { parseForExpression } from '../utils/StringUtils.js'
import { transitionIn, transitionOut } from '../utils/TransitionUtils.js'

/**
 * Add values add object by name in given order.
 * @param {Array<String>} names Names of values.
 * @param  {...Any} values Values to add to object.
 * @returns {Object} Resulting object with values at names.
 */
const createVariables = (names, ...values) => {
  const variables = {}
  for (let i = 0; i < values.length; i++) {
    if (i >= names.length) {
      break
    }
    variables[names[i]] = values[i]
  }
  return variables
}

/**
 * Finds the index of an element in list matching the value.
 * @param {HTMLElement} elements List of elements to search through.
 * @param {Any} value Value to compare to.
 * @param {Number} index The index to start searching after.
 */
const indexInSiblings = (elements, value, index = -1) => {
  index++
  if (index >= elements.length) {
    return -1
  }

  if (elements[index][FOR].value === value) {
    return index
  }

  return indexInSiblings(elements, value, index)
}

/**
 * Adds item to document at right index.
 * @param {Component} component Component attribute is part of.
 * @param {Function} update Update trigger function.
 * @param {DocumentFragment} template Template of items.
 * @param {Array<HTMLElement>} elements Existing item elements.
 * @param {Number} index Index to start looking from.
 * @param {Any} value Value of item to add.
 * @param {Object} variables Variables associated with item.
 */
const setAfter = (component, update, template, elements, index, value, variables) => {
  const existingIndex = indexInSiblings(elements, value, index)
  if (existingIndex >= 0) {
    // Exit early it is already in place.
    if (existingIndex === index + 1) {
      return
    }

    // Get existing element to move.
    const element = elements[existingIndex]

    // Move element after element at index or directly after the template.
    insertAfter(elements[index] ?? template, element)

    // Update all attributes using this for item's data.
    update(element[FOR].id)

    return
  }

  // Create new element from template.
  let element = document.importNode(template.content, true)
  // Add element after template or element at index.
  const sibling = index === -1 ? template : elements[index]
  insertAfter(sibling, element)
  // Get HTMLElement reference instead of DocumentFragment.
  element = sibling.nextElementSibling

  // Transition in.
  transitionIn(component, element)

  // Store data.
  element[FOR] = {
    id: Symbol('ID_FOR'),
    value: value,
    variables: variables,
  }

  // Store reference.
  elements.splice(index + 1, 0, element)
}

/**
 * Removes elements after maximum length.
 * @param {Array<HTMLElement>} elements List of existing elements.
 * @param {Number} maxLength Maximum number of elements.
 */
const removeAfter = (component, elements, maxLength) => {
  // Exit early if length is not exceeded.
  if (elements.length < maxLength) {
    return
  }

  // Iterate over exceeding elements.
  for (let i = elements.length - 1; i >= maxLength; i--) {
    // Remove element from list.
    const element = elements[i]
    elements.splice(i, 1)

    // Transition out.
    transitionOut(component, element, () => {
      element.remove()
    })
  }
}

export default {
  name: 'for',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    const template = attribute.getElement()

    // Check if placed on a template tag.
    if (template.tagName !== 'TEMPLATE') {
      console.warn('Doars: `for` directive must be placed on a `<template>` tag.')
      return
    }

    const data = parseForExpression(attribute.getValue())
    if (!data) {
      console.error('Doars: Error in `for` expression: ', attribute.getValue())
      return
    }

    // Get list of elements already made by this attribute.
    if (!attribute[FOR]) {
      attribute[FOR] = []
    }
    const elements = attribute[FOR]

    // Setup update method.
    const triggers = {}
    const update = (id) => {
      if (!triggers[id]) {
        triggers[id] = ['$for']
      }
    }

    // Get iterable value.
    let iterable
    // Check if iterable is a number.
    if (!isNaN(data.iterable)) {
      iterable = Number(data.iterable)
    } else {
      // Get iterable data, and this will automatically mark the data as being accessed by this component.
      iterable = executeExpression(component, attribute, data.iterable)
    }
    const iterableType = typeof (iterable)

    // Process iterable based on type.
    if (iterableType === 'number') {
      for (let index = 0; index < iterable; index++) {
        // Setup variables for context.
        const variables = createVariables(data.variables, index)

        // Add element based on data after previously iterated value.
        setAfter(component, update, template, elements, index - 1, iterable, variables)
      }

      // Remove old values.
      removeAfter(component, elements, iterable)
    } else if (iterableType === 'string') {
      for (let index = 0; index < iterable.length; index++) {
        // Get value at index.
        const value = iterable[index]

        // Setup variables for context.
        const variables = createVariables(data.variables, value, index)

        // Add element based on data after previously iterated value.
        setAfter(component, update, template, elements, index - 1, value, variables)
      }

      // Remove old values.
      removeAfter(component, elements, iterable.length)
    } else {
      // We can't rely on Array.isArray since it might be a proxy, therefore we try to convert it to an array.
      let isArray, length
      try {
        const values = [...iterable]
        isArray = true
        length = values.length
      } catch { }

      if (isArray) {
        for (let index = 0; index < length; index++) {
          // Get value at index.
          const value = iterable[index]

          // Setup variables for context.
          const variables = createVariables(data.variables, value, index)

          // Add element based on data after previously iterated value.
          setAfter(component, update, template, elements, index - 1, value, variables)
        }
      } else {
        const keys = Object.keys(iterable)
        length = keys.length

        for (let index = 0; index < length; index++) {
          // Get value at index.
          const key = keys[index]
          const value = iterable[key]

          // Setup variables for context.
          const variables = createVariables(data.variables, key, value, index)

          // Add element based on data after previously iterated value.
          setAfter(component, update, template, elements, index - 1, value, variables)
        }
      }

      // Remove old values.
      removeAfter(component, elements, length)
    }

    // Dispatch triggers.
    if (Object.getOwnPropertySymbols(triggers).length > 0) {
      component.update(triggers)
    }
  },

  destroy: (component, attribute) => {
    // Check if an object of lists exists.
    if (!component[FOR]) {
      return
    }

    // Check if list made by this attribute exist.
    if (!attribute[FOR]) {
      return
    }

    // Get list of elements created by this attribute.
    const elements = attribute[FOR]

    // Iterate over generated elements.
    for (const element of elements) {
      // Transition out.
      transitionOut(component, element, () => {
        // Remove element.
        element.remove()
      })
    }

    // Delete list of elements.
    delete attribute[FOR]
  },
}
