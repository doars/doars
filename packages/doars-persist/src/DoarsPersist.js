import createCookieContext from './contexts/cookies.js'
import createLocalStorageContext from './contexts/localStorage.js'
import createSessionStorageContext from './contexts/sessionStorage.js'

/**
 * @typedef {import('@doars/doars').default} Doars
 */

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {object} options The plugin options.
 */
export default function (
  library,
  options = null,
) {
  // Clone options.
  options = Object.assign({
    cookiesContextDeconstruct: false,
    cookiesContextName: '$cookies',
    localStorageContextDeconstruct: false,
    localStorageContextName: '$localStorage',
    sessionStorageContextDeconstruct: false,
    sessionStorageContextName: '$sessionStorage',
  }, options)

  // Set private variables.
  let isEnabled = false
  let cookiesContext,
    localStorageContext,
    sessionStorageContext

  const onEnable = (
  ) => {
    cookiesContext = createCookieContext(options)
    localStorageContext = createLocalStorageContext(options)
    sessionStorageContext = createSessionStorageContext(options)

    // Get index of state and insert the context directly before it.
    const existingContexts = library.getContexts()
    let stateIndex = 0
    for (let i = existingContexts.length - 1; i >= 0; i--) {
      const context = existingContexts[i]
      if (context.name === '$state') {
        stateIndex = i
        break
      }
    }
    library.addContexts(
      stateIndex,
      cookiesContext,
      localStorageContext,
      sessionStorageContext,
    )
  }

  const onDisable = (
  ) => {
    // Remove contexts.
    library.removeContexts(
      cookiesContext,
      localStorageContext,
      sessionStorageContext,
    )
    cookiesContext = null
    localStorageContext = null
    sessionStorageContext = null
  }

  this.disable = (
  ) => {
    // Check if library is disabled.
    if (!library.getEnabled() && isEnabled) {
      isEnabled = false

      // Stop listening to enable state of the library.
      library.removeEventListener('enabling', onEnable)
      library.removeEventListener('disabling', onDisable)
    }
  }

  this.enable = (
  ) => {
    if (!isEnabled) {
      isEnabled = true

      // Listen to enable state of the library.
      library.addEventListener('enabling', onEnable)
      library.addEventListener('disabling', onDisable)
    }
  }

  // Automatically enable plugin.
  this.enable()
}
