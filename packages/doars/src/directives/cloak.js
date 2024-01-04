import { transitionIn } from '@doars/common/src/utilities/Transition.js'

/**
 * @typedef {import('../Directive.js').Directive} Directive
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the cloak directive.
 * @param {DoarsOptions} options Library options.
 * @returns {Directive} The directive.
 */
export default ({
  cloakDirectiveName,
}) => ({
  name: cloakDirectiveName,

  update: (
    component,
    attribute,
  ) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    const libraryOptions = component.getLibrary().getOptions()

    // Remove attribute from element.
    element.removeAttribute(
      libraryOptions.prefix + '-' + this.name,
    )

    // Transition in.
    transitionIn(libraryOptions, element)
  },
})
