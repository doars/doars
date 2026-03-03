import Router from "../Router.js";
import { ROUTER } from "../symbols.js";

export default (options) => ({
	name: options.routerDirectiveName,

	update: (component, attribute, processExpression) => {
		// Deconstruct attribute.
		const element = attribute.getElement();

		// Get router.
		const router = element[ROUTER];
		if (!router) {
			// Create router
			element[ROUTER] = new Router(
				Object.assign(
					{},
					options,
					processExpression(component, attribute, attribute.getValue()),
				),
				component.getLibrary(),
			);
		}
	},

	destroy: (component, attribute) => {
		// Deconstruct attribute.
		const element = attribute.getElement();

		// Get router.
		const router = element[ROUTER];
		if (!router) {
			return;
		}

		// Remove router reference.
		delete element[ROUTER];

		// Deconstruct router.
		const id = router.getId();

		// Destroy router.
		router.destroy();

		// Deconstruct component.
		const library = component.getLibrary();

		// Trigger update due to changed router.
		library.update(`${id}:`);
	},
});
