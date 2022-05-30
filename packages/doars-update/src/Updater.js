// Import proxy dispatcher.
import ProxyDispatcher from '@doars/utils/src/events/ProxyDispatcher.js'

export default class Updater {
  constructor(options, callback) {
    // Overwrite default options.
    options = Object.assign({
      stepMinimum: 0,
    }, options)

    // Create id.
    const id = Symbol('ID_UPDATE')

    // Set private variables.
    let isEnabled = false, request

    // Setup time proxy.
    const proxy = new ProxyDispatcher({
      // We don't care when they are updated, we have a callback for that. They should never be updated by the user anyway.
      delete: false,
      set: false,
    })
    const time = proxy.add({})

    const update = (timeAbsolute) => {
      // Exit if not enabled any more.
      if (!isEnabled) {
        return
      }

      // Request to be updated next frame.
      request = window.requestAnimationFrame(update)

      // Set initial time values.
      if (!time.startMs) {
        time.currentMs = time.lastMs = time.startMs = timeAbsolute
        time.current = time.last = time.start = timeAbsolute / 1000
        time.delta = time.passed = time.deltaMs = time.passedMs = 0

        // Exit early after initial update.
        return
      }

      // Check if minimum time has been elapsed.
      const deltaMs = timeAbsolute - time.lastMs
      if (deltaMs <= options.stepMinimum) {
        return
      }

      // Update time values.
      time.lastMs = time.currentMs
      time.last = time.current
      time.currentMs = timeAbsolute
      time.current = timeAbsolute / 1000
      time.deltaMs = deltaMs
      time.delta = deltaMs / 1000
      time.passedMs += deltaMs // Adding the delta could introduce drift because we are not measuring from the start time, hover doing so would case issues if the updater is disabled and later on re-enabled. Due to the high precession the drift will only cause a noticeable effect after a long time, long enough to not cause a problem in most use cases. Long story short, good enough.
      time.passed = time.passedMs / 1000

      // Invoke callback.
      callback()
    }

    /**
     * Get whether the instance is enabled.
     * @returns {Bool} Whether the instance is enabled.
     */
    this.isEnabled = () => {
      return isEnabled
    }

    /**
     * Get updater id.
     * @returns {Symbol} Unique identifier.
     */
    this.getId = () => {
      return id
    }

    /**
     * Get time proxy.
     * @returns {ProxyDispatcher} Time proxy.
     */
    this.getProxy = () => {
      return proxy
    }

    /**
     * Get time data.
     * @returns {Proxy} Time data.
     */
    this.getTime = () => {
      return time
    }

    /**
     * Enable updater.
     */
    this.enable = () => {
      if (isEnabled) {
        return
      }
      isEnabled = true

      // Start update loop.
      request = window.requestAnimationFrame(update)
    }

    /**
     * Disable updater.
     */
    this.disable = () => {
      if (!isEnabled) {
        return
      }
      isEnabled = false

      // Stop updating.
      if (request) {
        cancelAnimationFrame(request)
        request = null
      }
    }
  }
}
