// Import symbols.
import { INTERSECT } from '../../symbols.js'

// Declare constants.
const EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  THROTTLE: 3,
}

export default (observer) => {
  return {
    name: 'intersect',

    update: (component, attribute, { processExpression }) => {
      // Deconstruct attribute.
      const element = attribute.getElement()
      const key = attribute.getKey()
      const value = attribute.getValue()

      // Check if existing handler exists.
      if (attribute[INTERSECT]) {
        // Exit early if value has not changed.
        if (attribute[INTERSECT].value === value) {
          return
        }

        // Stop observing the element.
        observer.remove(element, attribute[INTERSECT].handler)
        // Clear any ongoing timeouts.
        if (attribute[INTERSECT].timeout) {
          clearTimeout(attribute[INTERSECT].timeout)
        }
        // Delete directive data.
        delete attribute[INTERSECT]
      }

      // Deconstruct attribute.
      const modifiers = attribute.getModifiers()

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

      // Create intersection handler.
      const handler = (event) => {
        // Check if intersection has changed.
        const isChanged = attribute[INTERSECT].isIntersecting !== event.isIntersecting
        if (!isChanged) {
          return
        }

        // Update state in attribute data.
        attribute[INTERSECT].isIntersecting = event.isIntersecting

        // Exit early if expression should not be executed.
        if ((key === 'enter' && !event.isIntersecting) || (key === 'leave' && event.isIntersecting)) {
          // Clear existing timeout.
          if (attribute[INTERSECT].timeout) {
            clearTimeout(attribute[INTERSECT].timeout)
            attribute[INTERSECT].timeout = null
          }
          return
        }

        const execute = () => {
          // Execute value using a copy of the attribute since this attribute should not update based on what contexts will be accessed.
          processExpression(component, attribute.clone(), value, {
            $event: event,
          }, { return: false })

          // Reset the buffer.
          attribute[INTERSECT].buffer = []
        }

        // Store event in buffer.
        attribute[INTERSECT].buffer.push(event)

        // Check if we need to apply an execution modifier.
        if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
          // Exit early if buffer is not full.
          if (attribute[INTERSECT].buffer.length < modifiers.buffer) {
            return
          }

          execute()
        } else if (executionModifier === EXECUTION_MODIFIERS.BUFFER) {
          // Clear existing timeout.
          if (attribute[INTERSECT].timeout) {
            clearTimeout(attribute[INTERSECT].timeout)
            attribute[INTERSECT].timeout = null
          }

          // Setup timeout and execute expression when it finishes.
          attribute[INTERSECT].timeout = setTimeout(execute, modifiers.debounce)
        } else if (executionModifier === EXECUTION_MODIFIERS.THROTTLE) {
          // Get current time in milliseconds.
          const now = window.performance.now()

          // Exit early if throttle time has not passed.
          if (attribute[INTERSECT].lastExecution && now - attribute[INTERSECT].lastExecution < modifiers.throttle) {
            return
          }

          execute()

          // Store new latest execution time.
          attribute[INTERSECT].lastExecution = now
        } else {
          // Execute expression.
          execute()
        }
      }

      // Start observing the element.
      observer.add(element, handler)

      // Store handler.
      attribute[INTERSECT] = {
        buffer: [],
        handler: handler,
        isIntersecting: false,
        timeout: attribute[INTERSECT] ? attribute[INTERSECT].timeout : null,
        value: value,
      }
    },

    destroy: (component, attribute) => {
      // Check if a handler exists.
      if (!attribute[INTERSECT]) {
        return
      }

      // Deconstruct attribute.
      const element = attribute.getElement()

      // Stop observing the element.
      observer.remove(element, attribute[INTERSECT].handler)
      // Clear any ongoing timeouts.
      if (attribute[INTERSECT].timeout) {
        clearTimeout(attribute[INTERSECT].timeout)
      }
      // Delete directive data.
      delete attribute[INTERSECT]
    },
  }
}
