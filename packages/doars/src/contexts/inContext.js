import { createContexts } from "../utilities/Context.js";

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the inContext context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({ inContextContextName }) => ({
	revocable: false,

	name: inContextContextName,

	create: (component, attribute, _update, options) => ({
		value: (callback) => {
			// Create contexts.
			const { contexts, destroy } = createContexts(
				component,
				attribute,
				null,
				options,
			);

			// Invoke callback and store its result.
			const result = callback(contexts);

			// Destroy contexts.
			destroy();

			// Return callback's result.
			return result;
		},
	}),
});
