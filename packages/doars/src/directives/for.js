// Import symbols.
import { FOR } from '../symbols.js'

// Import utilities.
import { isPromise } from '@doars/common/src/utilities/Promise.js'
import { readdScripts } from '@doars/common/src/utilities/Script.js'
import { parseForExpression } from '@doars/common/src/utilities/String.js'
import {
  transitionIn,
  transitionOut,
} from '@doars/common/src/utilities/Transition.js'

/**
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Add values add object by name in given order.
 * @param {Array<string>} names Names of values.
 * @param  {...any} values Values to add to object.
 * @returns {object} Resulting object with values at names.
 */
const createVariables = (
  names,
  ...values
) => {
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
 * @param {any} value Value to compare to.
 * @param {number} offset The index to start searching after.
 * @returns {number} Index of value in elements.
 */
const indexInSiblings = (
  elements,
  value,
  offset = -1,
) => {
  offset++
  if (offset >= elements.length) {
    return -1
  }

  if (elements[offset][FOR].value === value) {
    return offset
  }

  return indexInSiblings(
    elements,
    value,
    offset,
  )
}

/**
 * Adds item to document at right index.
 * @param {Component} component Component attribute is part of.
 * @param {Function} update Update trigger function.
 * @param {DocumentFragment} template Template of items.
 * @param {Array<HTMLElement>} elements Existing item elements.
 * @param {number} index Index to start looking from.
 * @param {any} value Value of item to add.
 * @param {object} variables Variables associated with item.
 * @param {boolean} allowInlineScript Whether to allow inline scripts.
 * @returns {void}
 */
const setAfter = (
  component,
  update,
  template,
  elements,
  index,
  value,
  variables,
  allowInlineScript,
) => {
  const libraryOptions = component.getLibrary().getOptions()

  const existingIndex = indexInSiblings(elements, value, index)
  if (existingIndex >= 0) {
    // Exit early it is already in place.
    if (existingIndex === index + 1) {
      return
    }

    // Get existing element to move.
    const element = elements[existingIndex];

    // Move element after element at index or directly after the template.
    (elements[index] ? elements[index] : template).insertAdjacentElement('afterend', element)

    // Update all attributes using this for item's data.
    update(element[FOR].id)

    return
  }

  // Create new element from template.
  const element = document.importNode(template.content, true).firstElementChild
  // Add element after template or element at index.
  const sibling = index === -1 ? template : elements[index]
  sibling.insertAdjacentElement('afterend', element)
  if (allowInlineScript) {
    readdScripts(element)
  }

  // Transition in.
  transitionIn(libraryOptions, element)

  // Store data.
  element[FOR] = {
    id: Symbol('ID_FOR'),
    value,
    variables,
  }

  // Store reference.
  elements.splice(index + 1, 0, element)
}

/**
 * Removes elements after maximum length.
 * @param {Component} component Component the elements are part of.
 * @param {Array<HTMLElement>} elements List of existing elements.
 * @param {number} maxLength Maximum number of elements.
 */
const removeAfter = (
  component,
  elements,
  maxLength,
) => {
  // Exit early if length is not exceeded.
  if (elements.length < maxLength) {
    return
  }

  const libraryOptions = component.getLibrary().getOptions()

  // Iterate over exceeding elements.
  for (let i = elements.length - 1; i >= maxLength; i--) {
    // Remove element from list.
    const element = elements[i]
    elements.splice(i, 1)

    // Transition out.
    transitionOut(libraryOptions, element, () => {
      element.remove()
    })
  }
}

/**
 * Create the for directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  allowInlineScript,
  forDirectiveName,
}) => ({
  name: forDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Deconstruct attribute.
    const directive = attribute.getDirective()
    const template = attribute.getElement()
    const modifiers = attribute.getModifiers()

    // Check if placed on a template tag.
    if (template.tagName !== 'TEMPLATE') {
      console.warn('Doars: "' + directive + '" directive must be placed on a TEMPLATE tag.')
      return
    }

    const expression = parseForExpression(attribute.getValue())
    if (!expression) {
      console.error('Doars: Error in "' + directive + '" expression: ', attribute.getValue())
      return
    }

    // Setup update method.
    const triggers = {}
    const update = (id) => {
      if (!triggers[id]) {
        triggers[id] = ['$for']
      }
    }

    const set = (
      iterable,
    ) => {
      // Get stored data.
      const data = attribute.getData()

      // Get list of elements already made by this attribute.
      const elements = data.elements ? data.elements : []

      // Process iterable based on type.
      const iterableType = typeof (iterable)
      if (iterable !== null && iterable !== undefined) {
        if (iterableType === 'number') {
          for (let index = 0; index < iterable; index++) {
            // Setup variables for context.
            const variables = createVariables(expression.variables, index)

            // Add element based on data after previously iterated value.
            setAfter(component, update, template, elements, index - 1, iterable, variables, allowInlineScript || modifiers.script)
          }

          // Remove old values.
          removeAfter(component, elements, iterable)
        } else if (iterableType === 'string') {
          for (let index = 0; index < iterable.length; index++) {
            // Get value at index.
            const value = iterable[index]

            // Setup variables for context.
            const variables = createVariables(expression.variables, value, index)

            // Add element based on data after previously iterated value.
            setAfter(component, update, template, elements, index - 1, value, variables, allowInlineScript || modifiers.script)
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
              const variables = createVariables(expression.variables, value, index)

              // Add element based on data after previously iterated value.
              setAfter(component, update, template, elements, index - 1, value, variables, allowInlineScript || modifiers.script)
            }
          } else {
            const keys = Object.keys(iterable)
            length = keys.length

            for (let index = 0; index < length; index++) {
              // Get value at index.
              const key = keys[index]
              const value = iterable[key]

              // Setup variables for context.
              const variables = createVariables(expression.variables, key, value, index)

              // Add element based on data after previously iterated value.
              setAfter(component, update, template, elements, index - 1, value, variables, allowInlineScript || modifiers.script)
            }
          }

          // Remove old values.
          removeAfter(component, elements, length)
        }
      }

      // Dispatch triggers.
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        component.update(triggers)
      }

      // Store results.
      attribute.setData(
        Object.assign({}, data, {
          elements,
        }),
      )
    }

    // Get iterable value.
    let result
    // Check if iterable is a number.
    if (!isNaN(expression.iterable)) {
      result = Number(expression.iterable)
    } else {
      // Get iterable data, and this will automatically mark the data as being accessed by this component.
      result = processExpression(
        component,
        attribute,
        expression.iterable,
      )
    }

    // Get stored data.
    const data = attribute.getData()

    // Store results.
    attribute.setData(
      Object.assign({}, data, {
        result,
      }),
    )

    // Handle promises.
    if (isPromise(result)) {
      Promise.resolve(result)
        .then((
          resultResolved,
        ) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData().result !== result) {
            return
          }

          set(resultResolved)
        })
    } else {
      set(result)
    }
  },

  destroy: (
    component,
    attribute,
  ) => {
    // Get stored data.
    const data = attribute.getData()

    // Get list of elements created by this attribute.
    if (data.elements) {
      // Iterate over generated elements.
      for (const element of data.elements) {
        // Transition out.
        transitionOut(
          component.getLibrary().getOptions(),
          element,
          () => {
            // Remove element.
            element.remove()
          },
        )
      }
    }
  },
})
