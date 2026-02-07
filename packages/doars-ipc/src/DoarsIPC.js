/**
 * @typedef {import('@doars/doars').default} Doars
 */

import IntersectionDispatcher from "@doars/common/src/polyfills/IntersectionDispatcher.js";
import createIPCContext from "./contexts/ipc.js";
import createIPCDirective from "./directives/ipc.js";

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {object} options The plugin options.
 */
export default function (library, options = null) {
	// Clone options.
	options = Object.assign(
		{
			ipcContextName: "$ipc",
			ipcDirectiveName: "ipc",
			ipcInstance: null,

			intersectionEvent: "intersect",
			intersectionRoot: null,
			intersectionMargin: "0px",
			intersectionThreshold: 0,

			loadedEvent: "load",
		},
		options,
	);
	if (options.defaultInit) {
		Object.assign(options.ipcOptions, options.defaultInit);
	}

	// Set private variables.
	let isEnabled = false;

	// Setup observer.
	const intersectionDispatcher = options.intersectionEvent
		? new IntersectionDispatcher({
				root: options.intersectionRoot
					? options.intersectionRoot
					: library.getOptions().root,
				rootMargin: options.intersectionMargin,
				threshold: options.intersectionThreshold,
			})
		: null;

	// Store contexts and directives.
	const ipcContext = createIPCContext(options),
		ipcDirective = createIPCDirective(options, intersectionDispatcher);

	const onEnable = () => {
		// Create and add contexts and directives.
		library.addContexts(0, ipcContext);
		library.addDirectives(-1, ipcDirective);
	};

	const onDisable = () => {
		// Remove contexts and directives.
		library.removeContexts(ipcContext);
		library.removeDirective(ipcDirective);
	};

	this.disable = () => {
		// Check if library is disabled.
		if (!library.getEnabled() && isEnabled) {
			isEnabled = false;

			// Stop listening to enable state of the library.
			library.removeEventListener("enabling", onEnable);
			library.removeEventListener("disabling", onDisable);
		}
	};

	this.enable = () => {
		if (!isEnabled) {
			isEnabled = true;

			// Listen to enable state of the library.
			library.addEventListener("enabling", onEnable);
			library.addEventListener("disabling", onDisable);
		}
	};

	// Automatically enable plugin.
	this.enable();
}
