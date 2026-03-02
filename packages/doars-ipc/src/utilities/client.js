/**
 * @fileoverview Client-side IPC handler for WebView communication.
 * Manages outgoing calls to the server and handles responses via promises.
 * Designed to run inside the WebView environment.
 * @module @doars/doars-ipc/src/utilities/client
 */

/**
 * Creates a client-side IPC handler instance.
 * This handler manages the communication from the WebView to the Bun host,
 * using postMessage for requests and promise-based responses.
 * @returns {ClientHandler} The client handler instance with call, resolve, and reject methods.
 * @example
 * const clientHandler = createClientHandler();
 * window.__doarsIPC = clientHandler;
 *
 * // Make a call to the server
 * clientHandler.call('getData', { id: 123 })
 *   .then(result => console.log(result))
 *   .catch(error => console.error(error));
 */
export default () => {
	/**
	 * Auto-incrementing identifier for tracking pending calls.
	 * Starts at MIN_SAFE_INTEGER to avoid conflicts.
	 * @type {number}
	 * @private
	 */
	let identifier = Number.MIN_SAFE_INTEGER;

	/**
	 * Map of pending promise resolvers keyed by call identifier.
	 * Stores {resolve, reject} functions for each in-flight call.
	 * @type {Map<number, {resolve: Function, reject: Function}>}
	 * @private
	 */
	const openResolvers = new Map();

	/**
	 * @typedef {Object} ClientHandler
	 * @property {function(string, any): Promise<any>} call - Initiates an IPC call to the server.
	 * @property {function(number, any): void} resolve - Resolves a pending call with data.
	 * @property {function(number, string): void} reject - Rejects a pending call with an error.
	 */
	return {
		/**
		 * Initiates an IPC call to the server.
		 * Creates a promise that will be resolved/rejected when the server responds.
		 * Automatically increments the internal identifier for each call.
		 * @param {string} name - The route name to call on the server.
		 * @param {any} data - The data to send to the server. Will be JSON serialized.
		 * @returns {Promise<any>} A promise that resolves with the server response or rejects on error.
		 * @throws {Error} If the server rejects the call or if window.ipc is not available.
		 * @example
		 * clientHandler.call('fetchUser', { userId: 42 })
		 *   .then(user => updateUI(user))
		 *   .catch(err => showError(err.message));
		 */
		call: (name, data) => {
			identifier++;
			const currentId = identifier;

			return new Promise((resolve, reject) => {
				// Store the resolver functions for later resolution/rejection.
				openResolvers.set(currentId, { resolve, reject });

				// Send message to server via postMessage.
				// The message includes the id for correlation, the route name, and the data payload.
				window.ipc.postMessage(
					JSON.stringify({
						id: currentId,
						name,
						data,
					}),
				);
			});
		},

		/**
		 * Resolves a pending call with the provided data.
		 * Called by the server (via evaluateScript) to complete a request.
		 * Removes the resolver from the pending map after resolution.
		 * @param {number} identifier - The call identifier to resolve.
		 * @param {any} data - The response data from the server.
		 * @returns {void}
		 * @example
		 * // Called from server side:
		 * webview.evaluateScript(`window.__doarsIPC.resolve(123, { success: true })`);
		 */
		resolve: (identifier, data) => {
			const resolver = openResolvers.get(identifier);
			if (resolver) {
				openResolvers.delete(identifier);
				resolver.resolve(data);
			}
		},

		/**
		 * Rejects a pending call with an error message.
		 * Called by the server (via evaluateScript) when a request fails.
		 * Removes the resolver from the pending map after rejection.
		 * Creates an Error object from the error string before rejecting.
		 * @param {number} identifier - The call identifier to reject.
		 * @param {string} error - The error message from the server.
		 * @returns {void}
		 * @example
		 * // Called from server side:
		 * webview.evaluateScript(`window.__doarsIPC.reject(123, "Route not found")`);
		 */
		reject: (identifier, error) => {
			const resolver = openResolvers.get(identifier);
			if (resolver) {
				openResolvers.delete(identifier);
				resolver.reject(new Error(error));
			}
		},
	};
};
