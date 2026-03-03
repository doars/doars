/**
 * @typedef {import('../events/ProxyDispatcher.js').ProxyDispatcher} ProxyDispatcher
 */

/**
 * Factory function to create a context for a state which dispatched update events when mutated.
 * @param {string} name Name of the state.
 * @param {string} id Identifier of the state.
 * @param {object} state Data of the state.
 * @param {ProxyDispatcher} proxy Dispatcher to pass events through.
 * @returns {object} Proxied state and destroy callback.
 */
export default (name, id, state, proxy) => {
	return (component, attribute, options) => {
		const library = component.getLibrary();

		// Create event handlers.
		const onDelete = (_target, path) =>
			library.update(`${id}:${name}.${path.join(".")}`);
		const onGet = (_target, path) => {
			if (!options || options.accessed) {
				library.accessed(attribute, `${id}:${name}.${path.join(".")}`);
			}
		};
		const onSet = (_target, path) =>
			library.update(`${id}:${name}.${path.join(".")}`);

		// Add event listeners.
		proxy.addEventListener("delete", onDelete);
		proxy.addEventListener("get", onGet);
		proxy.addEventListener("set", onSet);

		return {
			value: state,

			// Remove event listeners.
			destroy: () => {
				proxy.removeEventListener("delete", onDelete);
				proxy.removeEventListener("get", onGet);
				proxy.removeEventListener("set", onSet);
			},
		};
	};
};
