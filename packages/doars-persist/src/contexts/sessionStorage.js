import ProxyDispatcher from "@doars/common/src/events/ProxyDispatcher.js";
import createState from "@doars/common/src/factories/createState.js";

import { getAll } from "../utilities/sessionStorage.js";

export default (
	{ sessionStorageContextDeconstruct, sessionStorageContextName },
	library,
) => {
	// Setup proxy that updates to local storage.
	const proxy = new ProxyDispatcher();
	proxy.addEventListener("delete", (_target, path) => {
		if (path.length > 1) {
			console.warn(
				`Nested local storage impossible tried to set "${path.join(".")}".`,
			);
		}
		sessionStorage.removeItem(path[0]);
	});
	proxy.addEventListener("set", (target, path) => {
		if (path.length > 1) {
			console.warn(
				`Nested local storage impossible tried to set "${path.join(".")}".`,
			);
		}
		sessionStorage.setItem(path[0], target[path[0]]);
	});
	const state = proxy.add(getAll());

	return {
		deconstruct: !!sessionStorageContextDeconstruct,

		name: sessionStorageContextName,

		create: createState(
			sessionStorageContextName,
			library.generateId(),
			state,
			proxy,
		),
	};
};
