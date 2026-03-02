/**
 * @typedef {import('@doars/doars').default} Doars
 */

import createNavigateDirective from "./directives/navigate.js";

/**
 * @typedef DoarsNavigateOptions
 * @type {object}
 * @property {object} [fetchOptions] - Default fetch options to use, the options object provided when calling fetch will be merged with this default.
 * @property {string} [intersectionMargin] - Only used when intersection is selected for the preload option. Specifies a set of offsets to add to the viewports bounding box when calculating intersections.
 * @property {number} [intersectionThreshold] - Only used when intersection is selected for the preload option. Specifies a ratio of intersection area to total bounding box area for the observed target.
 * @property {boolean} [navigateDirectiveEvaluate] - If set to false the navigate directive's value is read as a string literal instead of an expression to process.
 * @property {string} [navigateDirectiveName] - The name of the navigate directive.
 */

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {DoarsNavigateOptions} [options] The plugin options.
 */
const DoarsNavigate = function (library, options = null) {
	// Clone options.
	options = Object.assign(
		{
			fetchOptions: {},
			intersectionMargin: "0px",
			intersectionThreshold: 0,
			navigateDirectiveName: "navigate",
		},
		options,
	);

	// Set private variables.
	let isEnabled = false;
	// Store contexts and directives.
	const navigateDirective = createNavigateDirective(options);

	const onEnable = () => {
		// Create and add contexts and directives.
		library.addDirectives(-1, navigateDirective);
	};

	const onDisable = () => {
		// Remove contexts and directives.
		library.removeDirective(navigateDirective);
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
};

export default DoarsNavigate;
