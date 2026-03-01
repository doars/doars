/**
 * Delete a nested property from an object using dot-notation path.
 * @param {object} obj - The root object (e.g., window)
 * @param {string} path - Dot-notation path (e.g., "hello.world.ipc")
 * @returns {void}
 */
export const deleteNestedProperty = (obj, path) => {
	const parts = path.split(".");
	let current = obj;

	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		if (!Object.hasOwn(current, part)) {
			return;
		}
		current = current[part];
	}

	delete current[parts[parts.length - 1]];
};

/**
 * Get a nested property from an object using dot-notation path.
 * @param {object} obj - The root object (e.g., window)
 * @param {string} path - Dot-notation path (e.g., "hello.world.ipc")
 * @returns {any} The value at the path, or undefined if not found
 */
export const getNestedProperty = (obj, path) => {
	const parts = path.split(".");
	let current = obj;

	for (const part of parts) {
		if (
			current === null ||
			current === undefined ||
			!Object.hasOwn(current, part)
		) {
			return undefined;
		}
		current = current[part];
	}

	return current;
};

/**
 * Set a nested property on an object using dot-notation path.
 * Creates intermediate objects as needed.
 * @param {object} obj - The root object (e.g., window)
 * @param {string} path - Dot-notation path (e.g., "hello.world.ipc")
 * @param {any} value - The value to set
 * @returns {void}
 */
export const setNestedProperty = (obj, path, value) => {
	const parts = path.split(".");
	let current = obj;

	for (let i = 0; i < parts.length - 1; i++) {
		const part = parts[i];
		if (!Object.hasOwn(current, part) || typeof current[part] !== "object") {
			current[part] = {};
		}
		current = current[part];
	}

	current[parts[parts.length - 1]] = value;
};
