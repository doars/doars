import RevocableProxy from "@doars/common/src/polyfills/RevocableProxy.js";
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

		const library = component.getLibrary();

		// Create contexts proxy for children.
		let siblingsContexts;
		const revocable = RevocableProxy(
			parent.getChildren().filter((sibling) => sibling !== component),
			{
				get: (target, key, receiver) => {
					if (!siblingsContexts) {
						// Create list of child contexts.
						siblingsContexts = target.map((child) =>
							createContexts(child, attribute, null, options),
						);

						if (!options || options.accessed) {
							// Set children of this component as accessed.
							library.accessed(attribute, `${component.getId()}:siblings`);
						}
					}

					// If not a number then do a normal access.
					// biome-ignore lint/suspicious/noGlobalIsNan: Intentional coercion
					if (isNaN(key)) {
						return Reflect.get(siblingsContexts, key, receiver);
					}

					// Return context from child.
					const sibling = Reflect.get(siblingsContexts, key, receiver);
					if (sibling) {
						return sibling.contexts;
					}
				},
			},
		);

		return {
			value: revocable.proxy,

			destroy: () => {
				// Call destroy on all created contexts.
				if (siblingsContexts) {
					siblingsContexts.forEach((child) => {
						child.destroy();
					});
				}

				// Revoke proxy.
				revocable.revoke();
			},
		};
	},
});
