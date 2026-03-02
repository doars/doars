import { getNestedProperty } from "../utilities/nested.js";

/**
 * @typedef ContextOptions
 * @type {object}
 * @property {string} ipcContextName - The name of the IPC context.
 * @property {string} ipcPath - The path on the window object where the IPC client handler is mounted.
 */

/**
 * @param {ContextOptions} options Options used for creating the context.
 * @param {object} ipcInstance The IPC client handler instance.
 * @returns {object} Created IPC context.
 */
export default ({ ipcContextName, ipcPath }, ipcInstance) => ({
	name: ipcContextName,

	create: () => ({
		value: new Proxy(ipcInstance, {
			get: (target, key) => {
				// If the property exists on the instance, return it.
				if (Object.hasOwn(target, key)) {
					return target[key];
				}
				// Otherwise, return a function that calls the method via the client handler.
				return (...parameters) => {
					const handler = getNestedProperty(window, ipcPath);
					if (!handler) {
						throw new Error(`IPC handler not found at window.${ipcPath}`);
					}
					return handler.call(key, ...parameters);
				};
			},
		}),
	}),
});
