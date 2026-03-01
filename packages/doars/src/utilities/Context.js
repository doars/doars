/**
 * @typedef {import('../Attribute.js').default} Attribute
 * @typedef {import('../Component.js').default} Component
 * @typedef {import('../Context.js').DestroyFunction} DestroyFunction
 * @typedef {import('../Context.js').UpdateFunction} UpdateFunction
 * @typedef {import('../Doars.js').ContextMap} ContextMap
 */

import RevocableProxy from "@doars/common/src/polyfills/RevocableProxy.js";

/**
 * @typedef CreatedContexts
 * @type {object}
 * @property {ContextMap} contexts The contexts.
 * @property {() => never} destroy Destroy callback.
 * @property {string} before Text to place before function definition.
 * @property {string} after Text to place after function definition.
 * @property {Array<string>} deconstructed List of context names to deconstruct.
 */

const CONTEXT_REFLECTION_TRAPS = [
	"get",
	"getOwnPropertyDescriptor",
	"getPrototypeOf",
];

/**
 * Create component's contexts for an attributes expression.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {UpdateFunction} update Called when update needs to be invoked.
 * @param {object|null} extra Optional extra context items.
 * @returns {CreatedContexts} Expressions contexts and destroy functions.
 */
export const createContexts = (component, attribute, update, extra = null) => {
	const library = component.getLibrary();

	const creatableContexts = library.getContextsByName();
	const hasExtra = extra && typeof extra === "object";

	/** @type {Array<string>} */
	const irrevocable = [];
	const createableContextNames = [];
	const contextsKeysCache = [];
	for (const contextName in creatableContexts) {
		createableContextNames.push(contextName);
		contextsKeysCache.push(contextName);

		const creatableContext = creatableContexts[contextName];
		if (creatableContext.revocable === false) {
			irrevocable.push(contextName);
		}
	}
	const contexts = library.getSimpleContexts();
	for (const key of Object.keys(contexts)) {
		if (contextsKeysCache.indexOf(key) < 0) {
			contextsKeysCache.push(key);
		}
	}
	if (hasExtra) {
		for (const key of Object.keys(extra)) {
			if (contextsKeysCache.indexOf(key) < 0) {
				contextsKeysCache.push(key);
			}
		}
	}

	/** @type {Array<DestroyFunction>} */
	const destroyCallbacks = [];
	const addContext = (target, creatableContext) => {
		const result = creatableContext.create(component, attribute, update);
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
						if (contextsKeysCache.indexOf(key) < 0) {
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
		if (key in contexts) {
			attribute.accessed(component.getId(), key);
			return Reflect[functionName](target, key, ...otherParameters);
		}
		if (hasExtra && key in extra) {
			attribute.accessed(component.getId(), key);
			return Reflect[functionName](extra, key, ...otherParameters);
		}

		// Try to add deconstructable contexts in case it exists inside one of those, like the $state.
		if (!addedDeconstructed) {
			addDeconstruted(target);

			if (key in contexts) {
				attribute.accessed(component.getId(), key);
				return Reflect[functionName](target, key, ...otherParameters);
			}
		}

		// Try to add a missing context by the name of the key.
		if (createableContextNames.indexOf(key) >= 0) {
			addContext(target, creatableContexts[key]);

			if (key in contexts) {
				attribute.accessed(component.getId(), key);
				return Reflect[functionName](target, key, ...otherParameters);
			}
		}
	};

	const handler = {
		has: (target, key) => {
			if (!addedDeconstructed) {
				addDeconstruted(target);
			}
			return contextsKeysCache.indexOf(key) >= 0;
		},
		ownKeys: (target) => {
			if (!addedDeconstructed) {
				addDeconstruted(target);
			}
			return contextsKeysCache;
		},
	};
	for (const trap of CONTEXT_REFLECTION_TRAPS) {
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

/**
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {object|undefined} extra Optional extra context items.
 * @returns {Array<ContextMap|() => never>} Contexts and destroy function.
 */
export const createAutoContexts = (component, attribute, extra = null) => {
	// Collect update triggers.
	const triggers = [];
	const update = (id, context) => {
		triggers.push({
			id,
			path: context,
		});
	};

	const { contexts, destroy } = createContexts(
		component,
		attribute,
		update,
		extra,
	);

	return {
		contexts,
		destroy: () => {
			destroy();

			// Dispatch update triggers.
			if (triggers.length > 0) {
				component.getLibrary().update(triggers);
			}
		},
	};
};

export default {
	createContexts,
	createAutoContexts,
};
