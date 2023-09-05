// Import contexts and directive.
import contextMorph from './contexts/morph.js'
import directiveMorph from './directives/morph.js'

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 */
export default function (
  library,
) {
  // Set private variables.
  let isEnabled = false

  const onEnable = (
  ) => {
    // Add contexts and directives.
    library.addContexts(0, contextMorph)
    library.addDirectives(-1, directiveMorph)
  }
  const onDisable = (
  ) => {
    // Remove contexts and directives.
    library.removeContexts(contextMorph)
    library.removeDirectives(directiveMorph)
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
