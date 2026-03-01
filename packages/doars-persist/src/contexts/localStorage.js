import ProxyDispatcher from "@doars/common/src/events/ProxyDispatcher.js";
import createState from "@doars/common/src/factories/createState.js";

import { getAll } from "../utilities/localStorage.js";

export default ({
	localStorageContextDeconstruct,
	localStorageContextName,
}) => {
	// Setup proxy that updates to local storage.
	const proxy = new ProxyDispatcher();
	proxy.addEventListener("delete", (_target, path) => {
		if (path.length > 1) {
			console.warn(
				`Nested local storage impossible tried to set "${path.join(".")}".`,
			);
		}
		localStorage.removeItem(path[0]);
	});
	proxy.addEventListener("set", (target, path) => {
		if (path.length > 1) {
			console.warn(
				`Nested local storage impossible tried to set "${path.join(".")}".`,
			);
		}
		localStorage.setItem(path[0], target[path[0]]);
	});
	const state = proxy.add(getAll());

	return {
		deconstruct: !!localStorageContextDeconstruct,

		name: localStorageContextName,

		create: createState(
			localStorageContextName,
			Symbol("ID_LOCAL_STORAGE"),
			state,
			proxy,
		),
	};
};
