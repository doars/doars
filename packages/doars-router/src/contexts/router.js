import RevocableProxy from "@doars/common/src/polyfills/RevocableProxy.js";

// Import symbol.
import { ROUTER } from "../symbols.js";

// Import utilities.
import closestRouter from "../utilities/closestRouter.js";

export default ({ routerContextName }) => ({
	name: routerContextName,

	create: (component, attribute, options) => {
		const library = component.getLibrary();

		// Deconstruct attribute.
		const element = attribute.getElement();

		let router = null;
		const revocable = RevocableProxy(
			{},
			{
				get: (_target, propertyKey, receiver) => {
					// Get closest router from hierarchy.
					if (router === null) {
						if (element[ROUTER]) {
							router = element[ROUTER];
						} else {
							router = closestRouter(element);
						}

						// Set router to false so we don't look twice.
						if (!router) {
							router = false;
						}
					}

					if (!options || options.accessed) {
						// Mark as router accessed.
						library.accessed(attribute, `${router.getId()}:`);
					}

					if (!router) {
						return;
					}

					// Return router property.
					return Reflect.get(router, propertyKey, receiver);
				},
			},
		);

		return {
			value: revocable.proxy,

			destroy: () => {
				revocable.revoke();
			},
		};
	},
});
