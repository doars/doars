// Import external modules.
import { pathToRegexp } from 'path-to-regexp'

// Import event dispatcher.
import EventDispatcher from '@doars/common/src/events/EventDispatcher.js'

export default class Router extends EventDispatcher {
  /**
   * @param {object} options Router options.
   * - {string} basePath = '' - Base path of the routes.
   * - {string} path = '' - Initial active path.
   * - {object} pathToRegexp = {} - Path-to-RegExp options used for parsing route paths.
   * - {boolean} updateHistory = false - Whether to update the [History API](https://developer.mozilla.org/docs/Web/API/History_API).
   */
  constructor(
    options = {},
  ) {
    super()

    // Create id.
    const id = Symbol('ID_ROUTER')

    // Overwrite default with given options.
    options = Object.assign({
      basePath: '',
      path: null,
      pathToRegexp: {},
      updateHistory: false,
    }, options)

    let path = options.path
    let route = null
    let routes = {}

    // Listen for history state changes.
    const handleHistory = (
    ) => {
      this.setPath(window.location.pathname)
    }
    if (options.updateHistory) {
      window.addEventListener('popstate', handleHistory)
    }

    /**
     * Update route.
     * @param {string} url The base URL to update.
     * @param {string} newPath The new path to update to.
     * @param {string} newRoute The new route to update to.
     */
    const updateRoute = (
      url,
      newPath,
      newRoute,
    ) => {
      // Update stored data.
      path = newPath
      route = newRoute

      // Update page history if the option is set.
      if (options.updateHistory) {
        // Construct url.
        const _url = url.includes(options.basePath) ? url : options.basePath + url
        // Check if url is not current url.
        if (_url !== window.location.pathname) {
          // Add path to history.
          window.history.pushState(null, window.document.title, _url)
        }
      }

      // Dispatch event on router.
      this.dispatchEvent('changed', [this, route, path])
    }

    /**
     * Get router id.
     * @returns {symbol} Unique identifier.
     */
    this.getId = (
    ) => {
      return id
    }

    /**
     * Get current path.
     * @returns {string} path.
     */
    this.getPath = (
    ) => {
      return path
    }

    /**
     * Get current route.
     * @returns {string} Route.
     */
    this.getRoute = (
    ) => {
      return route
    }

    /**
     * Get observed routes.
     * @returns {Array<string>} List of routers.
     */
    this.getRoutes = (
    ) => {
      return Object.keys(routes)
    }

    /**
     * Destroy router instance.
     */
    this.destroy = (
    ) => {
      // Stop listening to state changes.
      if (options.updateHistory) {
        window.removeEventListener('popstate', handleHistory)
      }

      options = null
      path = null
      route = null
      routes = null

      // Dispatch add event.
      this.dispatchEvent('destroyed', [this])

      // Remove all listeners.
      this.removeAllEventListeners()
    }

    /**
     * Add route.
     * @param {string} _route Route pattern.
     */
    this.addRoute = (
      _route,
    ) => {
      // Convert path to regexp and store it in routes.
      routes[_route] = pathToRegexp(_route, [], options.pathToRegexp)

      // Dispatch add event.
      this.dispatchEvent('added', [this, _route])

      if (path) {
        // Remove base url, if present.
        const _path = path.replace(options.basePath, '')
        // Check if current route is.
        if (routes[_route].test(_path)) {
          updateRoute(path, _path, _route)
        }
      }
    }

    /**
     * Remove route.
     * @param {string} _route Route pattern.
     */
    this.removeRoute = (
      _route,
    ) => {
      // Delete route.
      delete routes[_route]

      // Dispatch removed event.
      this.dispatchEvent('removed', [this, _route])

      if (route === _route) {
        // Set current route as none.
        path = null
        route = null

        // Dispatch changed event.
        this.dispatchEvent('changed', [this, route, path])
      }
    }

    /**
     * Set current route.
     * @param {string} url URL path.
     */
    this.setPath = (
      url,
    ) => {
      // Remove base url, if present.
      const newPath = url.replace(options.basePath, '')
      if (path === newPath) {
        return
      }

      // Find matching routes.
      let newRoute = null
      for (const _route in routes) {
        // Test route.
        if (routes[_route].test(newPath)) {
          newRoute = _route
          break
        }
      }

      // Update route.
      updateRoute(url, newPath, newRoute)
    }
  }
}
