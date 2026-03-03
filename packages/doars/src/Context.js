/**
 * @typedef {import('./Attribute.js').default} Attribute
 * @typedef {import('./Component.js').default} Component
 */

/**
 * @typedef Context
 * @type {object}
 * @property {boolean|undefined} deconstruct Whether to deconstruct the context automatically.
 * @property {string} name Name of the directive.
 * @property {CreateFunction} create Function that creates the context instance.
 */

/**
 * @callback CreateFunction
 * @param {Component} component The component the context is being created for.
 * @param {Attribute} attribute The attribute the context is being created for.
 * @param {UpdateFunction} update Function to trigger a state update.
 * @param {Object} options Additional options for the context.
 * @returns {ContextValue|undefined} The resulting context.
 */

/**
 * @typedef ContextValue
 * @type {object}
 * @property {any} value Context value.
 * @property {DestroyFunction|undefined} destroy Cleans up the context again.
 */

/**
 * @callback DestroyFunction
 * @returns {never}
 */

export default {};
