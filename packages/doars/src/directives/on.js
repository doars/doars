// Import symbols.
import { ON } from '../symbols.js'

// Declare constants.
const CANCEL_EVENTS = {
  keydown: 'keyup',
  mousedown: 'mouseup',
  pointerdown: 'pointerup',
}
const EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  HELD: 3,
  HOLD: 4,
  THROTTLE: 5,
}
const KEYPRESS_MODIFIERS = [
  'alt',
  'ctrl',
  'meta',
  'shift',
]

export default {
  name: 'on',

  update: (component, attribute, { processExpression }) => {
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
    } else if (modifiers.held) {
      executionModifier = EXECUTION_MODIFIERS.HELD
      if (modifiers.held === true) {
        modifiers.held = 500
      }
    } else if (modifiers.hold) {
      executionModifier = EXECUTION_MODIFIERS.HOLD
      if (modifiers.hold === true) {
        modifiers.hold = 500
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

    // Set listener target and start listening.
    let target = element
    if (modifiers.document || modifiers.outside) {
      target = document
    } else if (modifiers.window) {
      target = window
    }

    const handler = (event) => {
      // Prevent repeat calls if prevent is set.
      if (attribute[ON].prevent) {
        return
      }

      // Disallow repeat calls if the modifier is not present.
      if (!modifiers.repeat && event.repeat) {
        return
      }

      // Only fire when self is provided if the target is the element itself.
      if (modifiers.self && event.target !== element) {
        return
      }

      // Don't fire with outside modifier unless the event came from outside.
      if (modifiers.outside && element.contains(event.target)) {
        return
      }

      // For keyboard events check the key is pressed.
      if ((name === 'keydown' || name === 'keyup') && key) {
        // Check if all key press modifiers are held.
        for (const keypressModifier of keypressModifiers) {
          if (!event[keypressModifier + 'Key']) {
            return
          }
        }

        // Convert key.
        let eventKey = modifiers.code ? event.code : event.key
        if (eventKey === ' ') {
          eventKey = 'space'
        }
        eventKey = eventKey.toLowerCase()

        // Check if the key matches.
        if (eventKey !== key) {
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
        processExpression(component, attribute.clone(), value, {
          $event: event,
          $events: attribute[ON].buffer,
        }, { return: false })

        // Reset the buffer.
        attribute[ON].buffer = []
      }

      // Store event in buffer.
      attribute[ON].buffer.push(event)

      // Check if we need to apply an execution modifier.
      switch (executionModifier) {
        case EXECUTION_MODIFIERS.BUFFER:
          // Exit early if buffer is not full.
          if (attribute[ON].buffer.length < modifiers.buffer) {
            return
          }

          execute()
          return

        case EXECUTION_MODIFIERS.DEBOUNCE:
          // Clear existing timeout.
          if (attribute[ON].timeout) {
            clearTimeout(attribute[ON].timeout)
            attribute[ON].timeout = null
          }

          // Setup timeout and execute expression when it finishes.
          attribute[ON].timeout = setTimeout(execute, modifiers.debounce)
          return

        // Execute the event when let go after the given time has exceeded.
        case EXECUTION_MODIFIERS.HELD:
          // Check if cancelable.
          if (!(name in CANCEL_EVENTS)) {
            console.warn('Doars: `on` directive, event of name "' + name + '" is not cancelable and can not have "held" modifier.')
            return
          }
          const cancelHeldName = CANCEL_EVENTS[name]

          // Store time of holding down.
          const nowHeld = window.performance.now()

          attribute[ON].cancel = (cancelEvent) => {
            // Check if minimum time has passed.
            if (window.performance.now() - nowHeld < modifiers.held) {
              attribute[ON].prevent = false
              return
            }

            // For keyboard events check any required key has been depressed.
            if (cancelHeldName === 'keyup' && key) {
              // Check if all key press modifiers are held.
              for (const keypressModifier of keypressModifiers) {
                if (!cancelEvent[keypressModifier + 'Key']) {
                  attribute[ON].prevent = false
                  return
                }
              }

              // Convert key.
              let eventKey = modifiers.code ? cancelEvent.code : cancelEvent.key
              if (eventKey === ' ') {
                eventKey = 'space'
              }
              eventKey = eventKey.toLowerCase()

              // Check if the key matches.
              if (eventKey !== key) {
                attribute[ON].prevent = false
                return
              }
            }

            // Only fire when self is provided if the target is the element itself.
            if (modifiers.self && cancelEvent.target !== element) {
              attribute[ON].prevent = false
              return
            }

            // Don't fire with outside modifier unless the event came from outside.
            if (modifiers.outside && element.contains(cancelEvent.target)) {
              attribute[ON].prevent = false
              return
            }

            // Execute expression.
            execute()
          }

          // Prevent repeat calls.
          attribute[ON].prevent = true

          target.addEventListener(cancelHeldName, attribute[ON].cancel, { once: true })
          return

        // Execute event when keys have been held down for the given time.
        case EXECUTION_MODIFIERS.HOLD:
          // Check if cancelable.
          if (!(name in CANCEL_EVENTS)) {
            console.warn('Doars: `on` directive, event of name "' + name + '" is not cancelable and can not have "hold" modifier.')
            return
          }
          const cancelHoldName = CANCEL_EVENTS[name]

          attribute[ON].cancel = (cancelEvent) => {
            // For keyboard events check any required key has been depressed.
            if (cancelHoldName === 'keyup' && key) {
              let keyLetGo = false

              // Check if all key press modifiers are held.
              for (const keypressModifier of keypressModifiers) {
                if (!cancelEvent[keypressModifier + 'Key']) {
                  keyLetGo = true
                }
              }

              // Convert key.
              let eventKey = modifiers.code ? cancelEvent.code : cancelEvent.key
              if (eventKey === ' ') {
                eventKey = 'space'
              }
              eventKey = eventKey.toLowerCase()

              // Check if the key matches.
              if (eventKey === key) {
                keyLetGo = true
              }

              if (!keyLetGo) {
                attribute[ON].prevent = false
                return
              }
            }

            // Only fire when self is provided if the target is the element itself.
            if (modifiers.self && cancelEvent.target !== element) {
              attribute[ON].prevent = false
              return
            }

            // Don't fire with outside modifier unless the event came from outside.
            if (modifiers.outside && element.contains(cancelEvent.target)) {
              attribute[ON].prevent = false
              return
            }

            // Prevent timeout from firing.
            clearTimeout(attribute[ON].timeout)
          }
          target.addEventListener(cancelHoldName, attribute[ON].cancel, { once: true })

          // Prevent repeat calls.
          attribute[ON].prevent = true

          // Setup timeout and execute expression when it finishes.
          attribute[ON].timeout = setTimeout(() => {
            // Ensure cancel is removed.
            target.removeEventListener(cancelHoldName, attribute[ON].cancel)

            // Allow calls again.
            attribute[ON].prevent = false

            // Execute expression.
            execute()
          }, modifiers.hold)
          return

        case EXECUTION_MODIFIERS.THROTTLE:
          // Get current time in milliseconds.
          const nowThrottle = window.performance.now()

          // Exit early if throttle time has not passed.
          if (attribute[ON].lastExecution && nowThrottle - attribute[ON].lastExecution < modifiers.throttle) {
            return
          }

          execute()

          // Store new latest execution time.
          attribute[ON].lastExecution = nowThrottle
          return
      }

      // Otherwise execute expression immediately.
      execute()
    }

    target.addEventListener(name, handler, options)

    // Store listener data on the component.
    attribute[ON] = {
      buffer: [],
      handler,
      target,
      timeout: attribute[ON] ? attribute[ON].timeout : undefined,
      value,
      prevent: false,
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

    // Clear any ongoing callbacks and timeouts.
    if (attribute[ON].cancel) {
      attribute[ON].target
        .removeEventListener(
          CANCEL_EVENTS[key],
          attribute[ON].cancel
        )
    }
    if (attribute[ON].timeout) {
      clearTimeout(attribute[ON].timeout)
    }

    // Delete directive data.
    delete attribute[ON]
  },
}
