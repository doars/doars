/**
 * @typedef {import('@doars/common/src/utilities/Transition.js').transition} Transition
 * @typedef {import('@doars/common/src/utilities/Transition.js').transitionIn} TransitionIn
 * @typedef {import('@doars/common/src/utilities/Transition.js').transitionOut} TransitionOut
 * @typedef {import('./Attribute.js').default} Attribute
 * @typedef {import('./Component.js').default} Component
 */

/**
 * @typedef Directive
 * @type {object}
 * @property {string} name Name of the directive.
 * @property {UpdateFunction} update Called when the directive is created or changed.
 * @property {DestroyFunction} destroy Called when the directive is removed.
 */

/**
 * @callback UpdateFunction
 * @param {Component} component The component the directive is part of.
 * @param {Attribute} attribute The attribute the directive is part of.
 * @param {ProcessExpression} processExpression Execute an expression of a directive.
 * @returns {never}
 */

/**
 * @callback DestroyFunction
 * @param {Component} component The component the directive is part of.
 * @param {Attribute} attribute The attribute the directive is part of.
 * @param {object} utilities
 * @returns {never}
 */

/**
 * @callback ProcessExpression
 * @param {Component} component The component the expression belongs to, either via the context or directive processing it.
 * @param {Attribute} attribute The attribute the expression belongs to, either via the context or directive processing it.
 * @param {string} expression The expression to process.
 * @param {?object} extra Additional context specific to the processing of the expression.
 * @param {?ProcessExpressionOptions} options Additional configurable options for processing the expression.
 * @returns {any} The expression result.
 */

/**
 * @typedef ProcessExpressionOptions
 * @type {object}
 * @property {boolean} return Whether to return the result of the processed expression.
 */

export default {}
