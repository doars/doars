/**
 * @typedef {import('@doars/doars').default} Doars
 */

import { deepAssign } from "@doars/common/src/utilities/Object.js";

import createRouterContext from "./contexts/router.js";
import createRouteDirective from "./directives/route.js";
import createRouterDirective from "./directives/router.js";
import createRouteToDirective from "./directives/routeTo.js";

/**
 * @typedef PathToRegexpOptions
 * @type {object}
 * @property {boolean} [sensitive] - Whether the regular expression will be case sensitive.
 * @property {boolean} [strict] - Whether the regular expression won't allow an optional trailing delimiter to match.
 * @property {boolean} [end] - Whether the regular expression will match to the end of the string.
 * @property {boolean} [start] - Whether the regular expression will match from the beginning of the string.
 * @property {string} [delimiter] - The default delimiter for segments.
 * @property {string} [endsWith] - Optional character, or list of characters, to treat as "end" characters.
 * @property {function} [encode] - A function to encode strings before inserting into the regular expression.
 * @property {string} [prefixes] - List of characters to automatically consider prefixes when parsing.
 */

/**
 * @typedef DoarsRouterOptions
 * @type {object}
 * @property {string} [basePath] - Base path of the routes.
 * @property {string} [path] - Initial active path.
 * @property {PathToRegexpOptions} [pathToRegexp] - Options used for parsing route paths.
 * @property {boolean} [updateHistory] - Whether to update the History API.
 * @property {string} [routerContextName] - The name of the router context.
 * @property {string} [routeDirectiveName] - The name of the route directive.
 * @property {string} [routerDirectiveName] - The name of the router directive.
 * @property {string} [routeToDirectiveName] - The name of the route to directive.
 */

/**
 * Create plugin instance.
 * @param {Doars} library Doars instance to add onto.
 * @param {DoarsRouterOptions} [options] The plugin options.
 */
export default function (library, options = null) {
	// Clone options.
	options = deepAssign(
		{
			basePath: "",
			path: "",
			pathToRegexp: {},
			updateHistory: false,

			routerContextName: "$router",
			routeDirectiveName: "route",
			routerDirectiveName: "router",
			routeToDirectiveName: "route-to",
		},
		options,
	);

	// Set private variables.
	let isEnabled = false;
	const routerContext = createRouterContext(options),
		routeDirective = createRouteDirective(options),
		routerDirective = createRouterDirective(options),
		routeToDirective = createRouteToDirective(options);

	const onEnable = () => {
		// Add contexts and directives.
		library.addContexts(0, routerContext);
		library.addDirectives(
			-1,
			routerDirective,
			routeDirective,
			routeToDirective,
		);
	};
	const onDisable = () => {
		// Remove contexts and directives.
		library.removeContexts(routerContext);
		library.removeDirectives(routeToDirective, routeDirective, routerDirective);
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
