// Import utilities.
import { parseSelector } from './String.js'
import { addAttributes, removeAttributes } from './Attribute.js'

// Transition name.
const TRANSITION_NAME = '-transition:'

/**
 * Transition an element.
 * @param {String} type Type of transition, for example 'in' and 'out'.
 * @param {Component} component Component the transitioning element is part of.
 * @param {HTMLElement} element Element to transition.
 * @param {Function} callback Function to call after transition is done.
 */
export const transition = (type, component, element, callback = null) => {
  // Only transition element nodes.
  if (element.nodeType !== 1) {
    if (callback) {
      callback()
    }
    return
  }

  // Get library options.
  const { prefix } = component.getLibrary().getOptions()

  // Transition attribute name.
  const transitionName = prefix + TRANSITION_NAME + type

  // Setup dispatcher function.
  const dispatchEvent = (phase) => {
    element.dispatchEvent(
      new CustomEvent('transition-' + phase)
    )
    element.dispatchEvent(
      new CustomEvent('transition-' + type + '-' + phase)
    )
  }

  // Declare variables for later.
  let name, value, timeout, requestFrame
  let isDone = false
  const selectors = {}

  // Process transition during attribute.
  name = transitionName
  value = element.getAttribute(name)
  // Parse and apply returned selector.
  if (value) {
    selectors.during = parseSelector(value)
    addAttributes(element, selectors.during)
  }

  // Process transition from attribute.
  name = transitionName + '.from'
  value = element.getAttribute(name)
  // Parse and apply returned selector.
  if (value) {
    selectors.from = parseSelector(value)
    addAttributes(element, selectors.from)
  }

  // Dispatch transition event.
  dispatchEvent('start')

  requestFrame = requestAnimationFrame(() => {
    requestFrame = null

    // If cancelled then stop immediately.
    if (isDone) {
      return
    }

    // Remove from selector.
    if (selectors.from) {
      removeAttributes(element, selectors.from)
      selectors.from = undefined
    }

    // Process transition to attribute.
    name = transitionName + '.to'
    value = element.getAttribute(name)
    // Parse and apply returned selector.
    if (value) {
      selectors.to = parseSelector(value)
      addAttributes(element, selectors.to)
    } else if (!selectors.during) {
      // Exit early if no active selectors set.

      // Dispatch end event.
      dispatchEvent('end')
      // Invoke callback.
      if (callback) {
        callback()
      }
      // Mark as done.
      isDone = true
      return
    }

    // Get computes style.
    const styles = getComputedStyle(element)

    let duration = Number(styles.transitionDuration.replace(/,.*/, '').replace('s', '')) * 1000
    if (duration === 0) {
      duration = Number(styles.animationDuration.replace('s', '')) * 1000
    }

    timeout = setTimeout(() => {
      timeout = null

      // If cancelled then stop immediately.
      if (isDone) {
        return
      }

      // Remove during selector.
      if (selectors.during) {
        removeAttributes(element, selectors.during)
        selectors.during = undefined
      }

      // Remove to selector.
      if (selectors.to) {
        removeAttributes(element, selectors.to)
        selectors.to = undefined
      }

      // Dispatch end event.
      dispatchEvent('end')
      // Invoke callback.
      if (callback) {
        callback()
      }
      // Mark as done.
      isDone = true
    }, duration)
  })

  return () => {
    if (!isDone) {
      return
    }
    isDone = true

    // Remove applied selector.
    if (selectors.during) {
      removeAttributes(element, selectors.during)
      selectors.during = undefined
    }
    if (selectors.from) {
      removeAttributes(element, selectors.from)
      selectors.from = undefined
    } else if (selectors.to) {
      removeAttributes(element, selectors.to)
      selectors.to = undefined
    }

    // Clear request animation frame and timeout.
    if (requestFrame) {
      cancelAnimationFrame(requestFrame)
      requestFrame = null
    } else if (timeout) {
      clearTimeout(timeout)
      timeout = null
    }

    // Dispatch end event.
    dispatchEvent('end')
    // Invoke callback.
    if (callback) {
      callback()
    }
  }
}

/**
 * Transition an element in.
 * @param {Component} component Component the transitioning element is part of.
 * @param {HTMLElement} element Element to transition.
 * @param {Function} callback Function to call after transition is done.
 */
export const transitionIn = (component, element, callback) => {
  return transition('in', component, element, callback)
}

/**
 * Transition an element out.
 * @param {Component} component Component the transitioning element is part of.
 * @param {HTMLElement} element Element to transition.
 * @param {Function} callback Function to call after transition is done.
 */
export const transitionOut = (component, element, callback) => {
  return transition('out', component, element, callback)
}

export default {
  transition,
  transitionIn,
  transitionOut,
}
