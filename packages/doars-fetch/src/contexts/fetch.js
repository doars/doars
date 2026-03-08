// Import utilities.
import { fetchAndParse } from "@doars/common/src/utilities/Fetch.js";
import { deepAssign } from "@doars/common/src/utilities/Object.js";

export default ({
	fetchContextName,
	fetchOptions,
	fetchAutoParse,
	fetchParsers,
}) => ({
	global: true,

	name: fetchContextName,

	create: () => {
		return {
			value: (url, options = null) => {
				// Apply default options to init.
				if (fetchOptions) {
					options = deepAssign({}, fetchOptions, options);
				}

				// Extract optional return type.
				const returnType = options.returnType ? options.returnType : null;
				delete options.returnType;

				// Extract per-request parsers and autoParse if provided
				const requestParsers = options.parsers || fetchParsers;
				const requestAutoParse =
					options.autoParse !== undefined ? options.autoParse : fetchAutoParse;
				delete options.parsers;
				delete options.autoParse;

				// Perform and process fetch request.
				return fetchAndParse(url, options, returnType, {
					autoParse: requestAutoParse,
					parsers: requestParsers,
				}).then((result) => {
					if (result?.value) {
						return result.value;
					}
				});
			},
		};
	},
});
