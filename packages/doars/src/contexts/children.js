import { createContexts } from "../utilities/Context.js";

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the children context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({ childrenContextName }) => ({
	name: childrenContextName,

	create: (component, attribute, options) => {
		options = {
			...options,
			global: false,
		};

		const childContexts = [];
		const childDestroys = [];
		for (const child of component.getChildren()) {
			const { contexts, destroy } = createContexts(
				child,
				attribute,
				null,
				options,
			);
			childContexts.push(contexts);
			childDestroys.push(destroy);
		}

		return {
			value: childContexts,

			destroy: () => {
				for (const childDestroy of childDestroys) {
					childDestroy();
				}
			},
		};
	},
});
