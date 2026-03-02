/**
 * @typedef {import('@doars/doars').default} Doars
 */

import IntersectionDispatcher from "@doars/common/src/polyfills/IntersectionDispatcher.js";
import createIPCContext from "./contexts/ipc.js";
import createIPCDirective from "./directives/ipc.js";
import createClientHandler from "./utilities/client.js";
import { deleteNestedProperty, setNestedProperty } from "./utilities/nested.js";

/**
 * @typedef DoarsIPCOptions
 * @type {object}
 * @property {string} [ipcContextName] - The name of the IPC context.
 * @property {string} [ipcDirectiveName] - The name of the IPC directive.
 * @property {string} [ipcPath] - The path on the window object where the IPC client handler is mounted.
 * @property {string|false} [intersectionEvent] - The name of the intersect special event listener. To disable the event from ever triggering set this option to false.
 * @property {HTMLElement} [intersectionRoot] - The element to be used as the viewport for checking the visibility of the elements.
 * @property {string} [intersectionMargin] - Margin around the root.
 * @property {number|Array<number>} [intersectionThreshold] - Thresholds of visibility the directive should be executed.
 * @property {string|false} [loadedEvent] - The name of the load special event listener. To disable the event from ever triggering set this option to false.
 */

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {DoarsIPCOptions} [options] The plugin options.
 */
export default function (library, options = null) {
	// Clone options.
	options = Object.assign(
		{
			ipcContextName: "$ipc",
			ipcDirectiveName: "ipc",
			ipcPath: "__doarsIPC",

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

	// Create the ipc intance.
	const ipcInstance = createClientHandler();

	// Setup observer.
	const intersectionDispatcher = options.intersectionEvent
		? new IntersectionDispatcher({
				root: options.intersectionRoot,
				rootMargin: options.intersectionMargin,
				threshold: options.intersectionThreshold,
			})
		: null;

	// Store contexts and directives.
	const ipcContext = createIPCContext(options, ipcInstance),
		ipcDirective = createIPCDirective(
			options,
			ipcInstance,
			intersectionDispatcher,
		);

	const onEnable = () => {
		setNestedProperty(window, options.ipcPath, ipcInstance);

		// Create and add contexts and directives.
		library.addContexts(0, ipcContext);
		library.addDirectives(-1, ipcDirective);
	};

	const onDisable = () => {
		// Remove contexts and directives.
		library.removeContexts(ipcContext);
		library.removeDirective(ipcDirective);

		deleteNestedProperty(window, options.ipcPath);
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
