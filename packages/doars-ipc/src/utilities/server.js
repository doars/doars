/**
 * @fileoverview Server-side IPC handler for WebView communication.
 * Manages route registration and handles incoming messages from the WebView.
 * Designed to run in the Bun host process.
 * @module @doars/doars-ipc/src/utilities/server
 */

/**
 * Callback function type for IPC routes.
 * @callback RouteCallback
 * @param {any} data - The data sent from the client.
 * @returns {Promise<any>|any} The response data, or a promise that resolves to it.
 */

/**
 * Creates a server-side IPC handler instance.
 * This handler manages the communication from the Bun host to the WebView,
 * routing incoming messages to registered callbacks and sending responses.
 * @param {string} path - The global path on window where the client handler is mounted (e.g., "__doarsIPC").
 * @param {function(string): void} evaluate - Function to evaluate JavaScript in the WebView's global scope.
 *   This is typically webview.evaluateScript from @webviewjs/webview.
 * @returns {ServerHandler} The server handler instance with register, unregister, handle, and dispatch methods.
 * @example
 * const webview = window.createWebview({ html: '...' });
 * const serverHandler = createServerHandler('__doarsIPC', (js) => webview.evaluateScript(js));
 *
 * // Register a route
 * serverHandler.register('getUser', async (data) => {
 *   return await database.getUser(data.id);
 * });
 *
 * // Handle incoming messages
 * webview.onIpcMessage((msg) => {
 *   serverHandler.handle(msg.body.toString());
 * });
 */
export default (path, evaluate) => {
	/**
	 * Map of registered route callbacks keyed by route name.
	 * @type {Map<string, RouteCallback>}
	 * @private
	 */
	const routes = new Map();

	/**
	 * @typedef {Object} ServerHandler
	 * @property {function(string, RouteCallback): void} register - Registers a new route handler.
	 * @property {function(string): void} unregister - Removes a registered route handler.
	 * @property {function(string): Promise<void>} handle - Processes an incoming IPC message.
	 * @property {function(string, any, string): void} dispatch - Dispatches a custom event to the DOM.
	 */
	return {
		/**
		 * Registers a new route handler.
		 * The callback will be invoked when a client calls this route name.
		 * Callbacks can be async and should return the response data.
		 * @param {string} name - The route name to register.
		 * @param {RouteCallback} callback - The function to call when this route is invoked.
		 * @returns {void}
		 * @example
		 * serverHandler.register('fetchData', async (params) => {
		 *   const result = await fetchFromDatabase(params.query);
		 *   return { items: result };
		 * });
		 */
		register: (name, callback) => {
			routes.set(name, callback);
		},

		/**
		 * Unregisters a previously registered route handler.
		 * After unregistering, calls to this route will return a "not found" error.
		 * @param {string} name - The route name to unregister.
		 * @returns {void}
		 * @example
		 * serverHandler.unregister('fetchData');
		 */
		unregister: (name) => {
			routes.delete(name);
		},

		/**
		 * Handles an incoming IPC message from the WebView.
		 * Parses the message, routes it to the appropriate callback,
		 * and sends the response back to the client via evaluate.
		 * Automatically handles errors and sends them back to the client.
		 * @param {string} message - The raw message string from the WebView (JSON formatted).
		 * @returns {Promise<void>}
		 * @example
		 * webview.onIpcMessage((msg) => {
		 *   serverHandler.handle(msg.body.toString());
		 * });
		 */
		handle: async (message) => {
			// Parse the incoming message as JSON.
			let parsed;
			try {
				parsed = JSON.parse(message);
			} catch (error) {
				console.error("Failed to parse incoming IPC message:", error);
				return;
			}

			const { id, name, data } = parsed;

			// Check if route exists.
			const route = routes.get(name);
			if (!route) {
				// Call client-side reject with error if route not found.
				evaluate(`window.${path}.reject(${id}, "Route '${name}' not found")`);
				return;
			}

			// Call the route with the data, wrapped in try-catch for error handling.
			try {
				const result = await route(data);
				// Call client-side resolve with the returned data.
				const jsonResult = JSON.stringify(result);
				evaluate(`window.${path}.resolve(${id}, ${jsonResult})`);
			} catch (error) {
				// Call client-side reject on error with the error message.
				const errorMessage =
					error instanceof Error ? error.message : String(error);
				evaluate(
					`window.${path}.reject(${id}, ${JSON.stringify(errorMessage)})`,
				);
			}
		},

		/**
		 * Dispatches a custom event to the WebView's DOM.
		 * This allows the server to proactively send events to the client
		 * without an explicit request.
		 * @param {string} name - The event type/name to dispatch.
		 * @param {any} event - The event data/detail to include with the event.
		 * @param {string} [selector="body"] - CSS selector for the target element. Defaults to "body".
		 * @returns {void}
		 * @example
		 * // Dispatch to body
		 * serverHandler.dispatch('update', { timestamp: Date.now() });
		 *
		 * // Dispatch to specific element
		 * serverHandler.dispatch('notification', { message: 'Hello' }, '#notification-area');
		 */
		dispatch: (name, event, selector = "body") => {
			evaluate(`
				(function() {
					const element = document.querySelector(${JSON.stringify(selector)});
					if (element) {
						element.dispatchEvent(
              new CustomEvent('${name}', {
                detail: ${JSON.stringify(event)},
                bubbles: true,
                cancelable: true,
              }),
            );
					}
				})();
			`);
		},
	};
};
