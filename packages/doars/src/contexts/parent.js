import { createContexts } from "../utilities/Context.js";

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the parent context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({ parentContextName }) => ({
	name: parentContextName,

	create: (component, attribute, options) => {
		const parent = component.getParent();
		if (!parent) {
			return {
				value: null,
			};
		}

		const { contexts, destroy } = createContexts(parent, attribute, null, {
			...options,
			global: false,
		});

		return {
			value: contexts,

			destroy,
		};
	},
});
