export default class IntersectionObserver {
  /**
   * Create observer instance.
   * @param {Object} options Intersection observer options.
   */
  constructor(options = null) {
    // Overwrite default options.
    options = Object.assign({
      root: null,
      rootMargin: '0px',
      threshold: 0,
    }, options)

    // Store data per element.
    const items = new WeakMap()

    /**
     * Intersection observer handler.
     * @param {Array<IntersectionObserverEntry>} entries Intersection observer entries.
     */
    const intersect = (entries) => {
      // Invoke callbacks of each entry.
      for (const entry of entries) {
        for (const callback of items.get(entry.target)) {
          callback(entry)
        }
      }
    }

    // Create intersection observer.
    const intersectionObserver = new IntersectionObserver(intersect, options)

    /**
     * Add element to observe.
     * @param {HTMLElement} element Element to observer.
     * @param {Function} callback Callback to call on intersection change.
     */
    this.add = (element, callback) => {
      // Add callback to list.
      if (!items.has(element)) {
        items.set(element, [])
      }
      items.get(element).push(callback)

      // Start observing element.
      intersectionObserver.observe(element)
    }

    /**
     * Remove element from observing.
     * @param {HTMLElement} element Element that is observed.
     * @param {Function} callback Callback that is called on intersection change.
     */
    this.remove = (element, callback) => {
      // Remove callback from list.
      if (!items.has(element)) {
        return
      }
      const list = items.get(element)
      const index = list.indexOf(callback)
      if (index >= 0) {
        list.splice(index, 1)
      }

      // Check if there are no more callbacks.
      if (list.length === 0) {
        // Remove element from callbacks list.
        items.delete(element)

        // Stop observing element.
        intersectionObserver.unobserve(element)
      }
    }
  }
}
