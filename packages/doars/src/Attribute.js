// Import event dispatcher.
import EventDispatcher from '@doars/common/src/events/EventDispatcher.js'

// Import symbols.
import { ATTRIBUTES } from './symbols.js'

// Import types.
import Component from './Component.js'

// Import utilities.
import {
  parseAttributeName,
  parseAttributeModifiers,
} from '@doars/common/src/utilities/String.js'

/**
 * @typedef {import('./Doars.js').default} Doars
 */

export default class Attribute extends EventDispatcher {
  /**
   * Create instance.
   * @param {Component} component Component instance.
   * @param {HTMLElement} element Element.
   * @param {string} name Attribute name (with library prefix removed).
   * @param {string} value Attribute value.
   * @param {boolean} isClone Whether this will be a clone of an existing attribute.
   */
  constructor(
    component,
    element,
    name,
    value,
    isClone = false,
  ) {
    super()

    // Create unique ID.
    const id = Symbol('ID_ATTRIBUTE')

    if (!isClone) {
      // Add attribute reference to the element.
      if (!element[ATTRIBUTES]) {
        element[ATTRIBUTES] = []
      }
      element[ATTRIBUTES].push(this)
    }

    // Create private variables.
    let accessedItems = {},
      data = null,
      directive,
      key,
      keyRaw,
      modifiersRaw,
      modifiers

    // Parse and store name.
    if (name) {
      // Parse and store attribute name.
      const [_directive, _keyRaw, _key, _modifiers] = parseAttributeName(
        component.getLibrary().getOptions().prefix,
        name,
      )
      directive = _directive
      key = _key
      keyRaw = _keyRaw
      modifiersRaw = _modifiers

      // Parse and store modifiers.
      if (_modifiers) {
        modifiers = parseAttributeModifiers(_modifiers)
      }
    }

    /**
     * Get the component this attribute is a part of.
     * @returns {Component} Attribute's component.
     */
    this.getComponent = (
    ) => {
      return component
    }

    /**
     * Get the element this attribute belongs to.
     * @returns {HTMLElement} Element.
     */
    this.getElement = (
    ) => {
      return element
    }

    /**
     * Get attribute id.
     * @returns {symbol} Unique identifier.
     */
    this.getId = (
    ) => {
      return id
    }

    /**
     * Get the directive this attribute matches.
     * @returns {string} Directive name.
     */
    this.getDirective = (
    ) => {
      return directive
    }

    /**
     * Get the optional key of the attribute.
     * @returns {string} Key.
     */
    this.getKey = (
    ) => {
      return key
    }

    /**
     * Get the optional key of the attribute before being processed.
     * @returns {string} Raw key.
     */
    this.getKeyRaw = (
    ) => {
      return keyRaw
    }

    /**
     * Get the optional modifiers of the attribute.
     * @returns {object} Modifiers object.
     */
    this.getModifiers = (
    ) => {
      return Object.assign({}, modifiers)
    }

    /**
     * Get the optional modifiers of the attribute before being processed.
     * @returns {Array<string>} List of raw modifiers.
     */
    this.getModifiersRaw = (
    ) => {
      return modifiersRaw
    }

    /**
     * Get attribute's name.
     * @returns {string} Attribute name.
     */
    this.getName = (
    ) => {
      return name
    }

    /**
     * Get the attribute's value.
     * @returns {string} Value.
     */
    this.getValue = (
    ) => {
      return value
    }

    /**
     * Set the attribute's value.
     * @param {string} _value New value.
     */
    this.setValue = (
      _value,
    ) => {
      value = _value

      // Dispatch changed event.
      this.dispatchEvent('changed', [this])
    }

    /**
     * Clear custom data set.
     */
    this.clearData = (
    ) => {
      data = null
    }

    /**
     * Whether there is data set.
     * @returns {boolean} Whether data is set.
     */
    this.hasData = (
    ) => {
      return data !== null
    }

    /**
     * Get custom data set previously.
     * @returns {any} the data.
     */
    this.getData = (
    ) => {
      return data
    }

    /**
     * Set custom attribute data.
     * @param {any} _data Some data.
     */
    this.setData = (
      _data,
    ) => {
      data = _data
    }

    /**
     * Destroy the attribute.
     */
    this.destroy = (
    ) => {
      // Clear data.
      this.setData(null)

      // Clear accessed.
      this.clearAccessed()

      // Remove attribute from element's attributes.
      const indexInElement = element[ATTRIBUTES].indexOf(this)
      if (indexInElement >= 0) {
        element[ATTRIBUTES].splice(indexInElement, 1)
      }

      // Dispatch destroy event.
      this.dispatchEvent('destroyed', [this])

      // Remove all listeners.
      this.removeAllEventListeners()
    }

    /**
     * Mark an item as accessed.
     * @param {symbol} id Unique identifier.
     * @param {string} path Context path.
     */
    this.accessed = (
      id,
      path,
    ) => {
      if (!accessedItems[id]) {
        accessedItems[id] = []
      } else if (accessedItems[id].includes(path)) {
        return
      }

      accessedItems[id].push(path)

      // Dispatch accessed event.
      this.dispatchEvent('accessed', [this, id, path])
    }

    /**
     * Clear list of accessed items.
     */
    this.clearAccessed = (
    ) => {
      accessedItems = {}
    }

    /**
     * Check if attribute accessed any of the item's paths.
     * @param {symbol} id Unique identifier.
     * @param {Array<string>} paths Contexts path.
     * @returns {boolean} Whether any item's path was accessed.
     */
    this.hasAccessed = (
      id,
      paths,
    ) => {
      if (!(id in accessedItems)) {
        return false
      }
      const accessedAtId = accessedItems[id]

      for (const path of paths) {
        if (accessedAtId.includes(path)) {
          return true
        }
      }
      return false
    }

    /**
     * Creates a clone of the attribute without copying over the id and accessed values.
     * @returns {Attribute} Cloned attribute.
     */
    this.clone = (
    ) => {
      // Create new attribute as clone.
      return new Attribute(
        component,
        element,
        name,
        value,
        true,
      )
    }
  }
}
