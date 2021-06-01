// Import external modules.
import { pathToRegexp } from 'path-to-regexp'

// Import event dispatcher.
import EventDispatcher from '@doars/doars/src/events/EventDispatcher.js'

class Router extends EventDispatcher {
  constructor(options = {}) {
    super()

    // Create id.
    const id = Symbol('ID_ROUTER')

    // Overwrite default with given options.
    options = Object.assign({
      basePath: '',
      updateHistory: false,
      pathToRegexp: {},
    }, options)

    let path = null
    let route = null
    let routes = {}

    // Listen for history state changes.
    const handleHistory = () => {
      this.setPath(window.location.pathname)
    }
    if (options.updateHistory) {
      window.addEventListener('popstate', handleHistory)
    }

    /**
     * Update route.
     * @param {String} url URL.
     * @param {String} _path Path.
     * @param {String} _route Route.
     */
    const updateRoute = function (url, _path, _route) {
      // Update stored data.
      path = _path
      route = _route

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
    }.bind(this)

    /**
     * Get router id.
     * @returns {Symbol} Unique identifier.
     */
    this.getId = () => {
      return id
    }

    /**
     * Get current path.
     * @returns {String} path.
     */
    this.getPath = () => {
      return path
    }

    /**
     * Get current route.
     * @returns {String} Route.
     */
    this.getRoute = () => {
      return route
    }

    /**
     * Get observed routes.
     * @returns {Array<String>} List of routers.
     */
    this.getRoutes = () => {
      return Object.keys(routes)
    }

    /**
     * Destroy router instance.
     */
    this.destroy = () => {
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
     * @param {String} _route Route pattern.
     */
    this.addRoute = function (_route) {
      // Convert path to regexp and store it in routes.
      routes[_route] = pathToRegexp(_route, [], options.pathToRegexp)

      // Dispatch add event.
      this.dispatchEvent('added', [this, _route])

      if (path) {
        // Remove base url, if present.
        const _path = _route.replace(options.basePath, '')
        // Check if current route is.
        if (routes[_route].test(_path)) {
          updateRoute(path, _path, _route)
        }
      }
    }

    /**
     * Remove route.
     * @param {String} _route Route pattern.
     */
    this.removeRoute = function (_route) {
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
     * @param {String} url URL path.
     */
    this.setPath = function (url) {
      // Remove base url, if present.
      const _path = url.replace(options.basePath, '')
      if (path === _path) {
        return
      }

      // Find matching routes.
      let newRoute = null
      for (const _route in routes) {
        // Test route.
        if (routes[_route].test(_path)) {
          newRoute = _route
          break
        }
      }

      // Update route.
      updateRoute(url, path, newRoute)
    }
  }
}

export default Router
