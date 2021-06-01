// Import symbols.
import { ON } from '../symbols.js'

// Declare constants.
const EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  THROTTLE: 3,
}
const KEYPRESS_MODIFIERS = ['alt', 'ctrl', 'meta', 'shift']

export default {
  name: 'on',

  update: (component, attribute, { executeExpression }) => {
    // Deconstruct attribute.
    let name = attribute.getKeyRaw()

    // Check if required key is set.
    if (!name) {
      console.warn('Doars: `on` directive must have a key.')
      return
    }

    // Process keyboard events.
    let key
    if (name.startsWith('keydown-')) {
      key = name.substring(8).toLowerCase()
      name = 'keydown'
    } else if (name.startsWith('keyup-')) {
      key = name.substring(6).toLowerCase()
      name = 'keyup'
    }

    // Deconstruct attribute.
    const element = attribute.getElement()
    const value = attribute.getValue()

    // Check if existing listener exists.
    if (attribute[ON]) {
      // Exit early if value has not changed.
      if (attribute[ON].value === value) {
        return
      }

      // Remove existing listener so we don't listen twice.
      attribute[ON].target.removeEventListener(name, attribute[ON].handler)

      // Clear any ongoing timeouts.
      if (attribute[ON].timeout) {
        clearTimeout(attribute[ON].timeout)
      }

      // Delete directive data.
      delete attribute[ON]
    }

    // Deconstruct attribute.
    const modifiers = attribute.getModifiers()

    // Process modifiers.

    // Set listener options.
    const options = {}
    if (modifiers.capture) {
      options.capture = true
    }
    if (modifiers.once) {
      options.once = true
    }
    if (modifiers.passive) {
      options.passive = true
    }

    // Process execution modifiers.
    let executionModifier = EXECUTION_MODIFIERS.NONE
    if (modifiers.buffer) {
      executionModifier = EXECUTION_MODIFIERS.BUFFER
      if (modifiers.buffer === true) {
        modifiers.buffer = 5
      }
    } else if (modifiers.debounce) {
      executionModifier = EXECUTION_MODIFIERS.DEBOUNCE
      if (modifiers.debounce === true) {
        modifiers.debounce = 500
      }
    } else if (modifiers.throttle) {
      executionModifier = EXECUTION_MODIFIERS.THROTTLE
      if (modifiers.throttle === true) {
        modifiers.throttle = 500
      }
    }

    // Store keypress modifiers.
    const keypressModifiers = []
    if (key) {
      // Convert command and super to meta.
      modifiers.meta = modifiers.meta ? true : modifiers.cmd || modifiers.super

      for (const modifier of KEYPRESS_MODIFIERS) {
        if (modifiers[modifier]) {
          keypressModifiers.push(modifier)
        }
      }
    }

    const handler = (event) => {
      // Only fire when self is provided if the target is the element itself.
      if (modifiers.self && event.target !== element) {
        return
      }

      if (modifiers.outside && element.contains(event.target)) { // Don't fire with outside modifier unless the event came from outside.
        return
      }

      if ((name === 'keydown' || name === 'keyup') && key) { // For keyboard events check the key pressed.
        // Check if all key press modifiers are held.
        for (const keypressModifier of keypressModifiers) {
          if (!event[keypressModifier + 'Key']) {
            return
          }
        }

        let eventKey = modifiers.code ? event.code : event.key
        if (eventKey === ' ') {
          eventKey = 'space'
        }
        eventKey = eventKey.toLowerCase()

        if (key !== eventKey) {
          return
        }
      }

      // Prevent default if the prevent modifier is present.
      if (modifiers.prevent) {
        event.preventDefault()
      }
      // Stop propagation if the stop modifier is present.
      if (modifiers.stop) {
        event.stopPropagation()
      }

      const execute = () => {
        // Execute value using a copy of the attribute since this attribute should not update based on what contexts will be accessed.
        executeExpression(component, attribute.clone(), value, {
          $event: event,
          $events: attribute[ON].buffer,
        }, { return: false })

        // Reset the buffer.
        attribute[ON].buffer = []
      }

      // Store event in buffer.
      attribute[ON].buffer.push(event)

      // Check if we need to apply an execution modifier.
      if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
        // Exit early if buffer is not full.
        if (attribute[ON].buffer.length < modifiers.buffer) {
          return
        }

        execute()
      } else if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
        // Clear existing timeout.
        if (attribute[ON].timeout) {
          clearTimeout(attribute[ON].timeout)
          attribute[ON].timeout = null
        }

        // Setup timeout and execute expression when it finishes.
        attribute[ON].timeout = setTimeout(execute, modifiers.debounce)
      } else if (executionModifier === EXECUTION_MODIFIERS.THROTTLE) {
        // Get current time in milliseconds.
        const now = window.performance.now()

        // Exit early if throttle time has not passed.
        if (attribute[ON].lastExecution && now - attribute[ON].lastExecution < modifiers.throttle) {
          return
        }

        execute()

        // Store new latest execution time.
        attribute[ON].lastExecution = now
      } else {
        // Execute expression.
        execute()
      }
    }

    // Set listener target and start listening.
    const target = modifiers.outside ? document : element
    target.addEventListener(name, handler, options)

    // Store listener data on the component.
    attribute[ON] = {
      buffer: [],
      handler: handler,
      target: target,
      timeout: attribute[ON] ? attribute[ON].timeout : undefined,
      value: value,
    }
  },

  destroy: (component, attribute) => {
    // Exit early if no listeners can be found.
    if (!attribute[ON]) {
      return
    }

    // Deconstruct attribute.
    const key = attribute.getKeyRaw()

    // Remove existing listener.
    attribute[ON].target.removeEventListener(key, attribute[ON].handler)

    // Clear any ongoing timeouts.
    if (attribute[ON].timeout) {
      clearTimeout(attribute[ON].timeout)
    }

    // Delete directive data.
    delete attribute[ON]
  },
}
