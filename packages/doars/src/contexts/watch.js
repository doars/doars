/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').default} Doars
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 * @typedef {import('../Doars.js').Trigger} Trigger
 */

import { createContexts } from '../utilities/Context.js'

/**
 * @callback WatchCallback
 * @param {object} context New context.
 * @returns {never}
 */

/**
 * @typedef WatchReturn
 * @type {Function}
 */

/**
 * Create the state context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  watchContextName,
}) => ({
  name: watchContextName,

  create: (
    component,
    attribute,
  ) => {
    let callbacks = null,
      contextIsDestroyed = false,
      directiveIsDestroyed = false,
      isInitialized = false,
      processExpression = null

    const initialized = (
    ) => {
      isInitialized = true
      callbacks = []

      // Get the expression processor.
      const library = component.getLibrary()
      processExpression = library.getProcessor()

      /**
       * @param {Doars} _ Doars library instance.
       * @param {Array<Trigger>} triggers List of triggers that will be handled.
       * @returns {void}
       */
      const onUpdate = (_, triggers) => {
        const ids = Object.getOwnPropertySymbols(triggers)
        if (ids.length > 0) {
          // Collect update triggers.
          const newTriggers = []
          const contextUpdate = (
            id,
            path,
          ) => {
            newTriggers.push({
              id,
              path,
            })
          }

          for (const id of ids) {
            for (const callback of callbacks) {
              // Process path in order to compare the triggers against the accessed values.
              if (!callback.attribute) {
                callback.attribute = attribute.clone()
                processExpression(
                  component,
                  callback.attribute,
                  callback.path,
                )
              }

              if (callback.attribute.hasAccessed(id, triggers[id])) {
                // Invoke callback and provide it with a new context.
                const {
                  contexts,
                  destroy,
                } = createContexts(
                  component,
                  attribute,
                  contextUpdate,
                  {},
                )
                callback.callback(contexts)
                destroy()

                // Go to the next callback, only allow it to be invoked once.
                continue
              }
            }
          }

          // Dispatch update triggers.
          if (newTriggers.length > 0) {
            component.getLibrary().update(newTriggers)
          }
        }
      }

      const stopHandling = () => {
        if (!directiveIsDestroyed) {
          // Mark as destroyed.
          directiveIsDestroyed = true

          // Remove any references to this context.
          attribute.removeEventListener('changed', stopHandling)
          attribute.removeEventListener('destroyed', stopHandling)
          library.removeEventListener('updating', onUpdate)
        }
      }
      // Stop handling since it will be re-ran.
      attribute.addEventListener('changed', stopHandling)
      // Stop handling since the attribute is destroyed.
      attribute.addEventListener('destroyed', stopHandling)

      // Start listening for changes.
      library.addEventListener('updating', onUpdate)
    }

    return {
      /**
       * Watch a value at the given path and on change invoke the callback.
       * @param {string} path Path to the value that needs to be watched.
       * @param {WatchCallback} callback Function to call when the value at the path has changed.
       * @returns {WatchReturn|undefined} Function to invoke the callback with.
       */
      value: (
        path,
        callback,
      ) => {
        // Don't allow new listeners after the context has been destroyed.
        if (contextIsDestroyed || directiveIsDestroyed) {
          return
        }

        if (!isInitialized) {
          initialized()
        }

        // Store path and callback.
        callbacks.push({
          path,
          callback,
        })

        // Return a function that can be called to invoke the callback immediately.
        return (
        ) => {
          // Collect update triggers.
          const newTriggers = []
          const contextUpdate = (
            id,
            path,
          ) => {
            newTriggers.push({
              id,
              path,
            })
          }

          // Invoke callback and provide it with a new context.
          const {
            contexts,
            destroy,
          } = createContexts(
            component,
            attribute.clone(),
            contextUpdate,
            {},
          )
          callback(contexts)
          destroy()

          // Dispatch update triggers.
          if (newTriggers.length > 0) {
            component.getLibrary().update(newTriggers)
          }
        }
      },

      destroy: () => {
        contextIsDestroyed = true
      },
    }
  },
})
