/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Context.js').DestroyFunction} DestroyFunction
 * @typedef {import('../Doars.js').ContextMap} ContextMap
 */

import RevocableProxy from "@doars/common/src/polyfills/RevocableProxy.js";

/**
 * @typedef CreatedContexts
 * @type {object}
 * @property {ContextMap} contexts The contexts.
 * @property {() => never} destroy Destroy callback.
 */

const PROXY_TRAPS = ["get", "getOwnPropertyDescriptor", "getPrototypeOf"];

/**
 * Create component's contexts for an attributes expression.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {object|null} extra Optional extra context items.
 * @param {object|null} options Optional options to specify whether access needs to be logged to the attribute.
 * @returns {CreatedContexts} Expressions contexts and destroy functions.
 */
export const createContexts = (
	component,
	attribute,
	extra = null,
	options = null,
) => {
	const addGlobal = !options || !options.global;
	const logAccess = !options || options.accessed;

	const library = component.getLibrary();

	const creatableContexts = library.getContextsByName();
	const hasExtra = extra && typeof extra === "object";

	/** @type {Array<string>} */
	const irrevocable = [];
	/** @type {Array<string>} */
	const createableContextNames = [];
	/** @type {Array<string>} */
	const contextsKeysCache = [];
	for (const contextName in creatableContexts) {
		const creatableContext = creatableContexts[contextName];
		// Skip global contexts if not allowed.
		if (!addGlobal && creatableContext.global) {
			continue;
		}

		createableContextNames.push(contextName);
		contextsKeysCache.push(contextName);

		if (creatableContext.revocable === false) {
			irrevocable.push(contextName);
		}
	}
	const contexts = library.getSimpleContexts();
	for (const key of Object.keys(contexts)) {
		if (!contextsKeysCache.includes(key)) {
			contextsKeysCache.push(key);
		}
	}
	if (hasExtra) {
		for (const key of Object.keys(extra)) {
			if (!contextsKeysCache.includes(key)) {
				contextsKeysCache.push(key);
			}
		}
	}

	/** @type {Array<DestroyFunction>} */
	const destroyCallbacks = [];
	const addContext = (target, creatableContext) => {
		if (!addGlobal && creatableContext.global) {
			return;
		}

		const result = creatableContext.create(component, attribute, options);
		if (result) {
			if (result.destroy && typeof result.destroy === "function") {
				destroyCallbacks.push(result.destroy);
			}

			if (result.value) {
				target[creatableContext.name] = result.value;
				return result.value;
			}
		}
	};

	let addedDeconstructed = false;
	const addDeconstruted = (target) => {
		addedDeconstructed = true;

		for (const contextName in creatableContexts) {
			const creatableContext = creatableContexts[contextName];
			if (creatableContext.deconstruct) {
				const resultValue = addContext(target, creatableContext);
				if (resultValue) {
					for (const key in resultValue) {
						if (!contextsKeysCache.includes(key)) {
							contextsKeysCache.push(key);
						}
						target[key] = resultValue[key];
					}
				}
			}
		}
	};

	const reflect = (functionName, ...parameters) => {
		const [target, key, ...otherParameters] = parameters;

		// First check if the key already exists on the contexts.
		if (Object.hasOwn(contexts, key)) {
			if (logAccess) {
				library.accessed(attribute, `${component.getId()}:${key}`);
			}
			return Reflect[functionName](target, key, ...otherParameters);
		}
		if (hasExtra && Object.hasOwn(extra, key)) {
			if (logAccess) {
				library.accessed(attribute, `${component.getId()}:${key}`);
			}
			return Reflect[functionName](extra, key, ...otherParameters);
		}

		// Try to add deconstructable contexts in case it exists inside one of those, like the $state.
		if (!addedDeconstructed) {
			addDeconstruted(target);

			if (Object.hasOwn(contexts, key)) {
				if (logAccess) {
					library.accessed(attribute, `${component.getId()}:${key}`);
				}
				return Reflect[functionName](target, key, ...otherParameters);
			}
		}

		// Try to add a missing context by the name of the key.
		if (createableContextNames.includes(key)) {
			addContext(target, creatableContexts[key]);

			if (Object.hasOwn(contexts, key)) {
				if (logAccess) {
					library.accessed(attribute, `${component.getId()}:${key}`);
				}
				return Reflect[functionName](target, key, ...otherParameters);
			}
		}
	};

	const handler = {
		has: (target, key) => {
			if (!addedDeconstructed) {
				addDeconstruted(target);
			}
			return contextsKeysCache.includes(key);
		},
		ownKeys: (target) => {
			if (!addedDeconstructed) {
				addDeconstruted(target);
			}
			return contextsKeysCache;
		},
	};
	for (const trap of PROXY_TRAPS) {
		handler[trap] = (...parameters) => {
			return reflect(trap, ...parameters);
		};
	}

	const revocable = RevocableProxy(contexts, handler, {
		irrevocable,
	});

	return {
		contexts: revocable.proxy,
		destroy: () => {
			for (let index = destroyCallbacks.length - 1; index >= 0; index--) {
				destroyCallbacks[index]();
			}
			revocable.revoke();
		},
	};
};

export default {
	createContexts,
};
