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
export default ({ siblingsContextName }) => ({
	name: siblingsContextName,

	create: (component, attribute, options) => {
		const parent = component.getParent();
		if (!parent) {
			return {
				value: [],
			};
		}

		options = {
			...options,
			global: false,
		};

		const siblingContexts = [];
		const siblingDestroys = [];
		for (const sibling of parent.getChildren()) {
			if (sibling !== component) {
				const { contexts, destroy } = createContexts(
					sibling,
					attribute,
					null,
					options,
				);
				siblingContexts.push(contexts);
				siblingDestroys.push(destroy);
			}
		}

		return {
			value: siblingContexts,

			destroy: () => {
				for (const siblingDestroy of siblingDestroys) {
					siblingDestroy();
				}
			},
		};
	},
});
