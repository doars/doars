/**
 * @typedef {import('@doars/doars').default} Doars
 */

import IntersectionDispatcher from "@doars/common/src/polyfills/IntersectionDispatcher.js";
import createFetchContext from "./contexts/fetch.js";
import createFetchDirective from "./directives/fetch.js";

/**
 * @typedef {Object} ResponseParser
 * @property {string[]} types - The types of responses the parser can handle.
 * @property {(response: Response, type: string) => Promise<any>} parser - The function to parse the response.
 */

/**
 * @typedef DoarsFetchOptions
 * @type {object}
 * @property {string} [fetchContextName] - The name of the fetch context.
 * @property {boolean} [fetchDirectiveEvaluate] - If set to false the fetch directive's value is read as a string literal instead of an expression to process.
 * @property {string} [fetchDirectiveName] - The name of the fetch directive.
 * @property {object} [fetchOptions] - Default fetch options to use, the options object provided when calling fetch will be merged with this default.
 * @property {boolean} [fetchAutoParse=true] - Whether to automatically parse the response based on content type. Enabled by default.
 * @property {ResponseParser[]} [fetchParsers] - Custom parsers to use in addition to built-in ones. Useful for adding support for YAML, TOML, CSV, etc.
 * @property {string|false} [intersectionEvent] - The name of the intersect special event listener. To disable the event from ever triggering set this option to false.
 * @property {HTMLElement} [intersectionRoot] - The element to be used as the viewport for checking the visibility of the elements.
 * @property {string} [intersectionMargin] - Margin around the root.
 * @property {number|Array<number>} [intersectionThreshold] - Thresholds of visibility the directive should be executed.
 * @property {string|false} [loadedEvent] - The name of the load special event listener. To disable the event from ever triggering set this option to false.
 */

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {DoarsFetchOptions} [options] The plugin options.
 */
export default function (library, options = null) {
	// Clone options.
	options = Object.assign(
		{
			fetchContextName: "$fetch",
			fetchDirectiveEvaluate: true,
			fetchDirectiveName: "fetch",
			fetchOptions: {},
			fetchAutoParse: true,
			fetchParsers: [],

			intersectionEvent: "intersect",
			intersectionRoot: null,
			intersectionMargin: "0px",
			intersectionThreshold: 0,

			loadedEvent: "load",
		},
		options,
	);
	// Backwards compatibility assign.
	if (options.defaultInit) {
		Object.assign(options.fetchOptions, options.defaultInit);
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
	const fetchContext = createFetchContext(options),
		fetchDirective = createFetchDirective(options, intersectionDispatcher);

	const onEnable = () => {
		// Create and add contexts and directives.
		library.addContexts(0, fetchContext);
		library.addDirectives(-1, fetchDirective);
	};

	const onDisable = () => {
		// Remove contexts and directives.
		library.removeContexts(fetchContext);
		library.removeDirective(fetchDirective);
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
