import ProxyDispatcher from "@doars/common/src/events/ProxyDispatcher.js";
import { walk } from "@doars/common/src/utilities/Element.js";
import Attribute from "./Attribute.js";
import Doars from "./Doars.js";

/**
 * @typedef {import('./Doars.js').default} Doars
 */

/**
 * @typedef Component
 * @type {object}
 * @property {() => Array<Component>} getChildren
 * @property {() => HTMLElement} getElement
 * @property {() => string} getId
 * @property {() => Doars} getLibrary
 * @property {() => Component} getParent
 * @property {() => ProxyDispatcher} getProxy
 * @property {() => ProxyConstructor} getState
 * @property {(_parent: Component) => void} setParent
 * @property {() => void} initialize
 * @property {() => void} destroy
 * @property {(element: HTMLElement, name: string, value: string) => Attribute} addAttribute
 * @property {(attribute: Attribute) => void} removeAttribute
 * @property {(element: HTMLElement) => Array<Attribute>} scanAttributes
 */

/**
 * Create a component instance.
 * @param {Doars} library Library instance.
 * @param {HTMLElement} element Element.
 * @returns {Component} The component data.
 */
export default (library, element) => {
	// Create unique ID.
	const id = library.generateId();

	const {
		prefix,
		childrenContextName,
		ignoreDirectiveName,
		parentContextName,
		stateDirectiveName,
	} = library.getOptions();

	const attributes = [],
		data = {},
		componentName = `${prefix}-${stateDirectiveName}`,
		ignoreName = `${prefix}-${ignoreDirectiveName}`,
		processExpression = library.getProcessor();

	// create private variables.
	let isInitialized = false,
		initialState,
		proxy,
		state;

	// Check if element has a state attribute.
	if (!element.attributes[`${prefix}-${stateDirectiveName}`]) {
		console.error(
			"Doars: element given to component does not contain a state attribute!",
		);
		return;
	}

	const component = {
		/**
		 * Get child components in hierarchy of this component.
		 * @returns {Array<Attribute>} List of components.
		 */
		getAttributes: () => {
			return attributes;
		},

		/**
		 * Get child components in hierarchy of this component.
		 * @returns {Array<Component>} List of components.
		 */
		getChildren: () => {
			return children;
		},

		/**
		 * Get custom data set previously.
		 * @param {string|Symbol} key Name to get the data from.
		 * @returns {any} the data.
		 */
		getData: (key) => {
			return data[key];
		},

		/**
		 * Set custom attribute data.
		 * @param {string|Symbol} key Name to set the data under.
		 * @param {any} _data Some data.
		 */
		setData: (key, _data) => {
			data[key] = _data;
		},

		/**
		 * Get root element of the component.
		 * @returns {HTMLElement} Element.
		 */
		getElement: () => {
			return element;
		},

		/**
		 * Get component id.
		 * @returns {symbol} Unique identifier.
		 */
		getId: () => {
			return id;
		},

		/**
		 * Get the library instance this component is from.
		 * @returns {Doars} Doars instance.
		 */
		getLibrary: () => {
			return library;
		},

		/**
		 * Get parent component in hierarchy of this component.
		 * @returns {Component} Component.
		 */
		getParent: () => {
			return parent;
		},

		/**
		 * Get the event dispatcher of state's proxy.
		 * @returns {ProxyDispatcher} State's proxy dispatcher.
		 */
		getProxy: () => {
			return proxy;
		},

		/**
		 * Get the component's state.
		 * @returns {Proxy} State.
		 */
		getState: () => {
			return state;
		},

		/**
		 * Set new parent component of this component.
		 * @param {Component} _parent Parent component.
		 */
		setParent: (_parent) => {
			parent = _parent;
		},

		/**
		 * Initialize the component.
		 */
		initialize: () => {
			if (isInitialized) {
				return;
			}

			// Set as enabled.
			isInitialized = true;

			// Get component's state attribute.
			const value = element.attributes[componentName].value;

			// Process expression for generating the state using a mock attribute.
			initialState = value
				? processExpression(
						component,
						new Attribute(library, component, element, null, value),
						value,
						{
							accessed: false,
						},
					)
				: {};
			if (initialState === null || initialState === undefined) {
				initialState = {};
			} else if (
				typeof initialState !== "object" ||
				Array.isArray(initialState)
			) {
				console.error(
					"Doars: component tag must return an object!",
					initialState,
				);
				return;
			}

			// Create proxy dispatcher for state.
			proxy = new ProxyDispatcher();
			// Add data to dispatcher to create the state.
			state = proxy.add(initialState);
		},

		/**
		 * Destroy the component.
		 */
		destroy: () => {
			if (!isInitialized) {
				return;
			}

			if (attributes.length > 0) {
				// Filter out directives without a destroy function.
				const directives = Object.assign({}, library.getDirectivesObject());
				for (const key in directives) {
					if (!directives[key].destroy) {
						directives[key] = undefined;
					}
				}

				for (const attribute of attributes) {
					// Clean up attribute if the directive has a destroy function.
					const directive = directives[attribute.getKey()];
					if (directive) {
						directive.destroy(component, attribute, processExpression);
					}

					// Destroy the attribute.
					attribute.destroy();
				}
			}

			// Reset variables.
			attributes.splice(0, attributes.length);

			// Set children as children of parent.
			if (children.length > 0) {
				for (const child of children) {
					// Set new parent of children.
					child.setParent(parent);

					// Add parent update trigger.
					library.update(`${child.getId()}:${parentContextName}`);
				}

				// Add children update trigger.
				library.update(`${id}:${childrenContextName}}`);
			}
			if (parent) {
				if (children.length > 0) {
					// Add children to parent.
					parent.getChildren().push(...children);

					// Add children update trigger.
					library.update(`${parent.getId()}:${childrenContextName}`);
				}

				// Add parent update trigger.
				library.update(`${id}:${parentContextName}`);
			}

			// Set as not initialized.
			isInitialized = false;

			// Remove state and state handling.
			proxy.remove(initialState);
			state = null;
			proxy = null;
			initialState = null;
		},

		/**
		 * Create and add an attribute. Assumes this attribute has not been added before.
		 * @param {HTMLElement} element Attribute element.
		 * @param {string} name Name of the attribute.
		 * @param {string} value Value of the attribute.
		 * @returns {Attribute} New attribute.
		 */
		addAttribute: (element, name, value) => {
			const attribute = new Attribute(library, component, element, name, value);
			attributes.push(attribute);
			return attribute;
		},

		/**
		 * Remove an attribute.
		 * @param {Attribute} attribute The attribute to remove.
		 */
		removeAttribute: (attribute) => {
			// Get index of attribute in list.
			const indexInAttributes = attributes.indexOf(attribute);
			if (indexInAttributes < 0) {
				return;
			}
			attributes.splice(indexInAttributes, 1);

			// Inform attribute of destruction so it can clean up after itself.
			attribute.destroy();
		},

		/**
		 * Scans element for new attributes. It assumes this element as not been read before and is part of the component.
		 * @param {HTMLElement|undefined} _element Element to scan.
		 * @returns {Array<Attribute>} New attributes.
		 */
		scanAttributes: (_element) => {
			if (!_element) {
				_element = element;
			}

			// Store from where new attributes will be added.
			const attributesLength = attributes.length;

			// Create iterator for walking over all elements in the component, skipping elements that are components or contain the ignore directive.
			const iterator = walk(
				_element,
				(subElement) =>
					!subElement.hasAttribute(componentName) &&
					!subElement.hasAttribute(ignoreName),
			);
			// Start on the given element then continue iterating over all children.
			do {
				for (const { name, value } of _element.attributes) {
					// Skip attribute if it is not that of a directive.
					if (library.isDirectiveName(name)) {
						component.addAttribute(_element, name, value);
					}
				}
				// biome-ignore lint/suspicious/noAssignInExpressions: Common while loop pattern
			} while ((_element = iterator()));

			// Return new attributes.
			return attributes.slice(attributesLength);
		},
	};

	const children = [];
	// Get current parent component.
	let parent = library.closestComponent(element);
	if (parent) {
		// Add to list of children in parent.
		const siblings = parent.getChildren();
		if (!siblings.includes(component)) {
			siblings.push(component);

			// Trigger children update.
			library.update(`${parent.getId()}:${childrenContextName}}`);
		}
	}

	return component;
};
