/**
 * @typedef {import('../Context.js').Context} Context
 * @typedef {import('../Doars.js').default} Doars
 * @typedef {import('../Doars.js').DoarsOptions} DoarsOptions
 * @typedef {import('../Doars.js').Trigger} Trigger
 */

import { createContexts } from "../utilities/Context.js";

/**
 * @callback WatchCallback
 * @param {object} context New context.
 * @returns {void}
 */

/**
 * @typedef WatchReturn
 * @type {Function}
 */

/**
 * Create the state context.
 * @param {DoarsOptions} options Library options.
 * @returns {Context} The context.
 */
export default ({ watchContextName }) => ({
	name: watchContextName,

	create: (component, attribute) => {
		let callbacks = null,
			contextIsDestroyed = false,
			directiveIsDestroyed = false,
			isInitialized = false;

		const componentId = component.getId();

		const initialize = () => {
			if (!isInitialized) {
				isInitialized = true;
				callbacks = [];

				// Get the expression processor.
				const library = component.getLibrary();

				/**
				 * @param {Doars} _ Doars library instance.
				 * @param {Array<Trigger>} triggers List of triggers that will be handled.
				 * @returns {void}
				 */
				const onUpdate = (_, triggers) => {
					const ids = Object.getOwnPropertySymbols(triggers);
					if (ids.length > 0) {
						for (const id of ids) {
							if (id === componentId) {
								for (const callbackData of callbacks) {
									// TODO: Get list of deconstruted contexts and see if it matches with any of them prefixed.

									if (triggers[id].includes(callbackData.path)) {
										// Invoke callback and provide it with a new context.
										const { contexts, destroy } = createContexts(
											component,
											attribute,
										);
										callbackData.callback(contexts);
										destroy();
									}
								}
							}
						}
					}
				};

				const stopHandling = () => {
					if (!directiveIsDestroyed) {
						// Mark as destroyed.
						directiveIsDestroyed = true;

						// Remove any references to this context.
						attribute.removeEventListener("changed", stopHandling);
						attribute.removeEventListener("destroyed", stopHandling);
						library.removeEventListener("updating", onUpdate);
					}
				};

				// Stop handling since it will be re-ran.
				attribute.addEventListener("changed", stopHandling);
				// Stop handling since the attribute is destroyed.
				attribute.addEventListener("destroyed", stopHandling);

				// Start listening for changes.
				library.addEventListener("updating", onUpdate);
			}
		};

		return {
			/**
			 * Watch a value at the given path and on change invoke the callback.
			 * @param {string} path Path to the value that needs to be watched.
			 * @param {WatchCallback} callback Function to call when the value at the path has changed.
			 * @returns {WatchReturn|undefined} Function to invoke the callback with.
			 */
			value: (path, callback) => {
				// Don't allow new listeners after the context has been destroyed.
				if (contextIsDestroyed || directiveIsDestroyed) {
					return;
				}

				initialize();

				// Store path and callback.
				callbacks.push({
					path,
					callback,
				});

				// Return a function that can be called to invoke the callback immediately.
				return async () => {
					// Invoke callback and provide it with a new context.
					const { contexts, destroy } = createContexts(
						component,
						attribute,
						null,
						{
							access: false,
						},
					);
					callback(contexts);
					destroy();
				};
			},

			destroy: () => {
				contextIsDestroyed = true;
			},
		};
	},
});
