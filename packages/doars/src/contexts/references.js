// Import symbols.
import RevocableProxy from "@doars/common/src/polyfills/RevocableProxy.js";

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the references context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({ referencesContextName, referenceDirectiveName }) => ({
	name: referencesContextName,

	create: (component, attribute, options) => {
		// Exit early if no references exist.
		if (!component.getData(referenceDirectiveName)) {
			return {
				value: [],
			};
		}

		const library = component.getLibrary();

		// Generate references cache.
		let cache = component.getData(referencesContextName);
		if (!cache) {
			// Get references from component.
			const references = component.getData(referenceDirectiveName);
			const attributeIds = Object.keys(references);

			// Convert references to a named object.
			cache = {};
			for (const id of attributeIds) {
				const { element, name } = references[id];
				cache[name] = element;
			}
			component.setData(referencesContextName, cache);
		}

		// Create revocable proxy.
		const revocable = RevocableProxy(cache, {
			get: (target, propertyKey, receiver) => {
				if (!options || options.accessed) {
					// Mark references as accessed.
					library.accessed(
						attribute,
						`${component.getId()}:${referencesContextName}.${propertyKey}`,
					);
				}

				// Return reference.
				return Reflect.get(target, propertyKey, receiver);
			},
		});

		// Return references proxy.
		return {
			value: revocable.proxy,

			destroy: () => {
				revocable.revoke();
			},
		};
	},
});
