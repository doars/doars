import createState from '@doars/common/src/factories/createState'

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the state context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({
  stateContextDeconstruct,
  stateContextName,
}) => ({
  deconstruct: stateContextDeconstruct,

  name: stateContextName,

  // Wrap create state so the component's data can be used.
  create: (
    component,
    attribute,
    update,
    utilities,
  ) => {
    // Deconstruct component.
    const proxy = component.getProxy()
    const state = component.getState()
    if (!proxy || !state) {
      return
    }

    return (
      createState(
        stateContextName,
        component.getId(),
        state,
        proxy,
      )(
        component,
        attribute,
        update,
        utilities,
      )
    )
  },
})
