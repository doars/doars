import EventDispatcher from "@doars/common/src/events/EventDispatcher.js";
import {
	parseAttributeModifiers,
	parseAttributeName,
} from "@doars/common/src/utilities/String.js";

import Component from "./Component.js";

/**
 * @typedef {import('./Doars.js').default} Doars
 */

export default class Attribute extends EventDispatcher {
	/**
	 * Create instance.
	 * @param {Doars} library Library instance.
	 * @param {Component} component Component instance.
	 * @param {HTMLElement} element Element.
	 * @param {string} name Attribute name (with library prefix removed).
	 * @param {string} value Attribute value.
	 */
	constructor(library, component, element, name, value) {
		super();

		// Create unique ID.
		const id = library.generateId();
		const processExpression = library.getProcessor();

		// Create private variables.
		let isEnabled = true,
			data,
			directive,
			directiveName,
			key,
			keyRaw,
			modifiers;

		// Parse and store name.
		if (name) {
			// Parse and store attribute name.
			const [_directive, _keyRaw, _key, _modifiers] = parseAttributeName(
				library.getOptions().prefix,
				name,
			);
			directiveName = _directive;
			key = _key;
			keyRaw = _keyRaw;

			directive = library.getDirectiveByName(directiveName);

			// Parse and store modifiers.
			if (_modifiers) {
				modifiers = Object.freeze(parseAttributeModifiers(_modifiers));
			}
		}

		/**
		 * Get the component this attribute is a part of.
		 * @returns {Component} Attribute's component.
		 */
		this.getComponent = () => {
			return component;
		};

		/**
		 * Get custom data set previously.
		 * @returns {any} the data.
		 */
		this.getData = () => {
			return data;
		};

		/**
		 * Set custom attribute data.
		 * @param {any} _data Some data.
		 */
		this.setData = (_data) => {
			data = _data;
		};

		/**
		 * Get the directive this attribute matches.
		 * @returns {string} Directive name.
		 */
		this.getDirective = () => {
			return directiveName;
		};

		/**
		 * Get the element this attribute belongs to.
		 * @returns {HTMLElement} Element.
		 */
		this.getElement = () => {
			return element;
		};

		this.getEnabled = () => {
			return isEnabled;
		};

		/**
		 * Get attribute id.
		 * @returns {symbol} Unique identifier.
		 */
		this.getId = () => {
			return id;
		};

		/**
		 * Get the optional key of the attribute.
		 * @returns {string} Key.
		 */
		this.getKey = () => {
			return key;
		};

		/**
		 * Get the optional key of the attribute before being processed.
		 * @returns {string} Raw key.
		 */
		this.getKeyRaw = () => {
			return keyRaw;
		};

		/**
		 * Get the library this attribute is a part of.
		 * @returns {Doars} Attribute's library.
		 */
		this.getLibrary = () => {
			return library;
		};

		/**
		 * Get the optional modifiers of the attribute.
		 * @returns {object} Modifiers object.
		 */
		this.getModifiers = () => {
			return modifiers;
		};

		/**
		 * Get attribute's name.
		 * @returns {string} Attribute name.
		 */
		this.getName = () => {
			return name;
		};

		/**
		 * Get the attribute's value.
		 * @returns {string} Value.
		 */
		this.getValue = () => {
			return value;
		};

		/**
		 * Set the attribute's value.
		 * @param {string} _value New value.
		 */
		this.setValue = (_value) => {
			value = _value;

			// Dispatch changed event.
			this.dispatchEvent("changed", [this]);
		};

		/**
		 * Destroy the attribute.
		 */
		this.destroy = () => {
			isEnabled = false;

			if (directive?.destroy) {
				directive.destroy(component, this, processExpression);
			}

			// Clear data.
			data = null;

			// Dispatch destroy event.
			this.dispatchEvent("destroyed", [this]);

			// Remove all listeners.
			this.removeAllEventListeners();
		};

		this.update = () => {
			if (directive) {
				directive.update(component, this, processExpression);
			}
		};
	}
}
