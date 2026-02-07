import { getNestedProperty } from "../utilities/nested.js";

export default ({ ipcContextName, ipcPath }, ipcInstance) => ({
	name: ipcContextName,

	create: () => ({
		value: new Proxy(ipcInstance, {
			get: (target, prop) => {
				// If the property exists on the instance, return it.
				if (prop in target) {
					return target[prop];
				}
				// Otherwise, return a function that calls the method via the client handler.
				return (...args) => {
					const handler = getNestedProperty(window, ipcPath);
					if (!handler) {
						throw new Error(`IPC handler not found at window.${ipcPath}`);
					}
					return handler.call(prop, ...args);
				};
			},
		}),
	}),
});
