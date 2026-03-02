// Import symbols.

import Router from "../Router.js";
import { ROUTER } from "../symbols.js";

/**
 * Get closest router in hierarchy.
 * @param {HTMLElement} element Element to start searching from.
 * @returns {Router | undefined} Closest router.
 */
const closestRouter = (element) => {
	if (element.parentElement) {
		element = element.parentElement;

		if (element[ROUTER]) {
			/** @type {Router} */
			return element[ROUTER];
		}

		return closestRouter(element);
	}
};

export default closestRouter;
