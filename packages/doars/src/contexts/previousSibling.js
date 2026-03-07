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
export default ({ previousSiblingContextName }) => ({
	name: previousSiblingContextName,

	create: (component, attribute, options) => {
		const parent = component.getParent();
		if (!parent) {
			return {
				value: null,
			};
		}
		const siblings = parent.getChildren();
		const index = siblings.indexOf(component);
		if (index <= 0) {
			return {
				value: null,
			};
		}

		const { contexts, destroy } = createContexts(
			siblings[index - 1],
			attribute,
			null,
			{
				...options,
				global: false,
			},
		);

		return {
			value: contexts,

			destroy,
		};
	},
});
