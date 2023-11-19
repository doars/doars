export default class EventDispatcher {
  /**
   * Create instance.
   */
  constructor(
  ) {
    let events = {}

    /**
     * Add callback to event.
     * @param {string} name Event name.
     * @param {Function} callback Function to call on dispatch.
     * @param {object} options Callback options.
     */
    this.addEventListener = (
      name,
      callback,
      options = null,
    ) => {
      // Check if event name exits and callback is not already present.
      if (!(name in events)) {
        events[name] = []
      }

      // Add to events.
      events[name].push({
        callback,
        options,
      })
    }

    /**
     * Remove callback from event.
     * @param {string} name Event name.
     * @param {Function} callback Function that would be called.
     */
    this.removeEventListener = (
      name,
      callback,
    ) => {
      // Check if event exists.
      if (!Object.keys(events).includes(name)) {
        return
      }
      const eventData = events[name]

      // Get index of callback in events.
      let index = -1
      for (let i = 0; i < eventData.length; i++) {
        if (eventData[i].callback === callback) {
          index = i
          break
        }
      }
      if (index < 0) {
        return
      }

      // Remove item from events.
      eventData.splice(index, 1)

      // Remove event if list is empty.
      if (Object.keys(eventData).length === 0) {
        delete events[name]
      }
    }

    /**
     * Remove listeners to an event.
     * @param {string} name Event name.
     */
    this.removeEventListeners = (
      name,
    ) => {
      if (!name) {
        return
      }

      // Remove all handlers with the event name.
      delete events[name]
    }

    /**
     * Remove all listeners.
     */
    this.removeAllEventListeners = (
    ) => {
      // Remove all listeners.
      events = {}
    }

    /**
     * Trigger event and dispatch data to listeners.
     * @param {string} name Event name.
     * @param {Array<any>} parameters Event parameters to pass through.
     * @param {object} options Dispatch options.
     */
    this.dispatchEvent = (
      name,
      parameters,
      options = null,
    ) => {
      // Check if event exists.
      if (!events[name]) {
        return
      }
      // Get events by trigger name.
      const eventData = events[name]

      // Dispatch a call to each event.
      for (let i = 0; i < eventData.length; i++) {
        const event = (options && options.reverse) ? eventData[eventData.length - (i + 1)] : eventData[i]

        // If once is truthy then remove the callback.
        if (event.options && event.options.once) {
          eventData.splice(i, 1)
        }

        // Execute callback.
        event.callback(...parameters)
      }
    }
  }
}
