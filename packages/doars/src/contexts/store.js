import ProxyDispatcher from "@doars/common/src/events/ProxyDispatcher.js";
import createState from "@doars/common/src/factories/createState.js";
import { deepAssign } from "@doars/common/src/utilities/Object.js";

/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 */

/**
 * Create the store context.
 * @param {DoarsOptions} options Library options.
 * @param {string} id Unique ID for the data store.
 * @returns {Context} The context.
 */
export default (
	{ storeContextDeconstruct, storeContextInitial, storeContextName },
	id,
) => {
	// Create a single proxy for the store.
	const data = deepAssign({}, storeContextInitial);
	const proxy = new ProxyDispatcher();
	const state = proxy.add(data);

	return {
		deconstruct: !!storeContextDeconstruct,

		name: storeContextName,

		create: createState(storeContextName, id, state, proxy),
	};
};
