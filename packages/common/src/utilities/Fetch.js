/**
 * @typedef {Object} ResponseParser Defines a response parser.
 * @property {string[]} types The types of responses the parser can handle.
 * @property {(response: Response, type: string) => Promise<any>} parser The function to parse the response.
 */

/**
 * Built-in parsers for common response types.
 * @type {ResponseParser[]}
 */
const builtInParsers = [
	{
		types: ["arraybuffer"],
		parser: (response) => response.arrayBuffer(),
	},
	{
		types: ["blob"],
		parser: (response) => response.blob(),
	},
	{
		types: ["formdata"],
		parser: (response) => response.formData(),
	},
	{
		types: ["json"],
		parser: (response) => response.json(),
	},
	{
		types: ["text", "txt"],
		parser: (response) => response.text(),
	},
	{
		types: ["element", "html-partial"],
		parser: async (response) => {
			const text = await response.text();
			const template = document.createElement("template");
			template.innerHTML = text;
			return template.content.childNodes;
		},
	},
	{
		types: ["html"],
		parser: async (response) => {
			const text = await response.text();
			return new DOMParser().parseFromString(text, "text/html");
		},
	},
	{
		types: ["svg"],
		parser: async (response) => {
			const text = await response.text();
			return new DOMParser().parseFromString(text, "image/svg+xml");
		},
	},
	{
		types: ["xml"],
		parser: async (response) => {
			const text = await response.text();
			return new DOMParser().parseFromString(text, "application/xml");
		},
	},
];

/**
 * Find a parser for the given type.
 * @param {string} type The type to find a parser for.
 * @param {ResponseParser[]} customParsers Additional custom parsers to check.
 * @returns {ResponseParser|undefined} The matching parser or undefined.
 */
const findParser = (type, customParsers = []) => {
	const lowerType = String.prototype.toLowerCase.call(type);
	// Check custom parsers first
	for (const parser of customParsers) {
		if (parser.types.includes(lowerType)) {
			return parser;
		}
	}
	// Check built-in parsers
	for (const parser of builtInParsers) {
		if (parser.types.includes(lowerType)) {
			return parser;
		}
	}
	return undefined;
};

/**
 * Convert response to a desired type.
 * @param {Response} response The response to parse.
 * @param {string} type Simplified type name the data should be converted to.
 * @param {ResponseParser[]} [customParsers] Custom parsers to use in addition to built-in ones.
 * @returns {Promise<any>} Resulting data.
 */
export const parseResponse = (response, type, customParsers) => {
	const parser = findParser(type, customParsers);

	if (!parser) {
		console.warn(`Unknown response type "${type}" used.`);
		return null;
	}

	return parser.parser(response, type);
};

/**
 * Try and get the mime type of the response.
 * @param {Response} response Response to try and get the type from.
 * @param {Request} request Request the response originates from.
 * @returns {string} mime type.
 */
export const responseType = (response, request = null) => {
	// Check content type header.
	let contentType = response.headers.get("Content-Type");
	if (contentType) {
		contentType = String.prototype.toLowerCase.call(contentType).split(";")[0];
		const result = simplifyType(contentType.trim());
		if (result) {
			return result;
		}
	}

	// Check url extension.
	let extension = response.url.split(".");
	if (extension) {
		extension = extension[extension.length - 1];
		switch (extension) {
			case "htm":
			case "html":
				return "html";

			case "json":
				return "json";

			case "svg":
				return "svg";

			case "txt":
				return "text";

			case "xml":
				return "xml";
		}
	}

	// Check accept type header.
	if (request) {
		let acceptTypes = request.headers.Accept;
		if (acceptTypes) {
			acceptTypes = String.prototype.toLowerCase.call(acceptTypes).split(",");
			for (let acceptType of acceptTypes) {
				acceptType = acceptType.split(";")[0].trim();
				const result = simplifyType(acceptType);
				if (result) {
					return result;
				}
			}
		}
	}

	return null;
};

/**
 * Simplify the mime type to single word.
 * @param {string} mimeType Mime type to simplify.
 * @returns {string} Simplified type.
 */
export const simplifyType = (mimeType) => {
	switch (mimeType) {
		case "text/html":
			return "html";

		case "text/html-partial":
			return "html-partial";

		case "text/json":
		case "application/json":
		case "application/ld+json":
		case "application/vnd.api+json":
			return "json";

		case "image/svg+xml":
			return "svg";

		case "text/plain":
			return "text";

		case "application/xml":
		case "text/xml":
			return "xml";
	}
};

/**
 * @typedef {Object} FetchAndParseOptions
 * @property {boolean} [autoParse=true] Whether to automatically parse the response based on content type.
 * @property {ResponseParser[]} [parsers] Custom parsers to use in addition to built-in ones.
 */

/**
 *
 * @param {string} url Fetch URL.
 * @param {Request} options Fetch options.
 * @param {string} returnType Simplified type name the data should be converted to.
 * @param {FetchAndParseOptions} [parseOptions] Options for parsing the response.
 * @returns {Promise<any>} Resulting data.
 */
export const fetchAndParse = (url, options, returnType, parseOptions = {}) =>
	new Promise((resolve, reject) => {
		const { autoParse = true, parsers = [] } = parseOptions;

		fetch(url, options)
			.then((response) => {
				if (response.status < 200 || response.status >= 500) {
					reject(response);
					return;
				}

				// Automatically base return type on header if autoParse is enabled.
				if (autoParse && (!returnType || returnType === "auto")) {
					returnType = responseType(response, options);
				}

				// If autoParse is disabled and no returnType specified, return raw response.
				if (!autoParse && !returnType) {
					response.value = response;
					resolve(response);
					return;
				}

				// Parse response based on return type.
				const responseParse = parseResponse(response, returnType, parsers);
				if (!responseParse) {
					throw new Error("No valid response returned.");
				}
				responseParse.then((responseValue) => {
					response.value = responseValue;
					resolve(response);
				});
			})
			.catch((error) => {
				reject(error);
			});
	});

export default {
	fetchAndParse,
	parseResponse,
	responseType,
	simplifyType,
	builtInParsers,
	findParser,
};
