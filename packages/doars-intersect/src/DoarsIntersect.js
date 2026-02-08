/**
 * @typedef {import('@doars/doars').default} Doars
 */

import IntersectionDispatcher from "@doars/common/src/polyfills/IntersectionDispatcher.js";
import createIntersectDirective from "./directives/intersect.js";

/**
 * @typedef DoarsIntersectOptions
 * @type {object}
 * @property {string} [intersectDirectiveName] - The name of the intersect directive.
 * @property {HTMLElement} [intersectionRoot] - The element to be used as the viewport for checking the visibility of the elements.
 * @property {string} [intersectionMargin] - Margin around the root.
 * @property {number|Array<number>} [intersectionThreshold] - Thresholds of visibility the directive should be executed.
 */

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {DoarsIntersectOptions} [options] The plugin options.
 */
export default function (library, options = null) {
	// Clone options.
	options = Object.assign(
		{
			intersectDirectiveName: "intersect",

			intersectionRoot: null,
			intersectionMargin: "0px",
			intersectionThreshold: 0,
		},
		options,
	);

	// Set private variables.
	let isEnabled = false;

	// Setup observer.
	const intersectionDispatcher = new IntersectionDispatcher({
		root: options.intersectionRoot
			? options.intersectionRoot
			: library.getOptions().root,
		rootMargin: options.intersectionMargin,
		threshold: options.intersectionThreshold,
	});

	// Create directive.
	const intersectionDirective = createIntersectDirective(
		options,
		intersectionDispatcher,
	);

	const onEnable = () => {
		// Add directive.
		library.addDirectives(-1, intersectionDirective);
	};

	const onDisable = () => {
		// Remove directive.
		library.removeDirectives(intersectionDirective);
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
