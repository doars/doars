// Import symbols.
import { COMPONENT } from './symbols.js'

// Import classes.
import Attribute from './Attribute.js'

// Import proxy dispatcher.
import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'

// Import utilities.
import { closestComponent } from './utilities/Component.js'
import { transition, transitionIn, transitionOut } from '@doars/common/src/utilities/Transition.js'
import { walk } from '@doars/common/src/utilities/Element.js'

export default class Component {
  /**
   * Create instance.
   * @param {Doars} library Library instance.
   * @param {HTMLElement} element Element.
   */
  constructor(library, element) {
    // Create unique ID.
    const id = Symbol('ID_COMPONENT')

    // Deconstruct library options.
    const { prefix, processor } = library.getOptions()

    // Get the expression processor.
    const processorType = typeof (processor)
    let processExpression
    if (processorType === 'function') {
      processExpression = processor
    } else if (processorType === 'string' && library.constructor[processor + 'Expression']) {
      processExpression = library.constructor[processor + 'Expression']
    } else {
      console.warn('Doars: Expression processor not found. Using fallback instead.')
      processExpression = library.constructor.executeExpression ?? library.constructor.interpretExpression ?? library.constructor.callExpression
    }
    if (!processExpression) {
      console.error('Doars: No expression processor available. Process option: ', process)
    }

    // Create a immutable object with the directive utilities.
    const directiveUtilities = Object.freeze({
      processExpression: processExpression,
      transition: transition,
      transitionIn: transitionIn,
      transitionOut: transitionOut,
    })

    // create private variables.
    let attributes = [], hasUpdated = false, isInitialized = false, data, proxy, state

    // Check if element has a state attribute.
    if (!element.attributes[prefix + '-state']) {
      console.error('Doars: element given to component does not contain a state attribute!')
      return
    }

    // Add reference to element.
    element[COMPONENT] = this

    // Update position in hierarchy.
    const children = []
    // Get current parent component.
    let parent = closestComponent(element)
    if (parent) {
      // Add to list of children in parent.
      if (!parent.getChildren().includes(this)) {
        parent.getChildren().push(this)

        // Trigger children update.
        library.update([{
          id: parent.getId(),
          path: 'children',
        }])
      }
    }

    /**
     * Get the attributes in this component.
     * @returns {Array<Attribute>} List of attributes.
     */
    this.getAttributes = () => {
      return attributes
    }

    /**
     * Get child components in hierarchy of this component.
     * @returns {Array<Component>} List of components.
     */
    this.getChildren = () => {
      return children
    }

    /**
     * Get root element of the component.
     * @returns {HTMLElement} Element.
     */
    this.getElement = () => {
      return element
    }

    /**
     * Get component id.
     * @returns {Symbol} Unique identifier.
     */
    this.getId = () => {
      return id
    }

    /**
     * Get the library instance this component is from.
     * @returns {Doars} Doars instance.
     */
    this.getLibrary = () => {
      return library
    }

    /**
     * Get parent component in hierarchy of this component.
     * @returns {Component} Component.
     */
    this.getParent = () => {
      return parent
    }

    /**
     * Get the event dispatcher of state's proxy.
     * @returns {ProxyDispatcher} State's proxy dispatcher.
     */
    this.getProxy = () => {
      return proxy
    }

    /**
     * Get the component's state.
     * @returns {Proxy} State.
     */
    this.getState = () => {
      return state
    }

    /**
     * Set new parent component of this component.
     * @param {Component} _parent Parent component.
     */
    this.setParent = (_parent) => {
      parent = _parent
    }

    /**
     * Initialize the component.
     */
    this.initialize = () => {
      if (isInitialized) {
        return
      }

      // Set as enabled.
      isInitialized = true

      // Get component's state attribute.
      const componentName = prefix + '-state'
      const value = element.attributes[componentName].value

      // Process expression for generating the state using a mock attribute.
      data = value ? processExpression(this, new Attribute(this, element, null, value), value) : {}
      if (data === null) {
        data = {}
      } else if (typeof (data) !== 'object' || Array.isArray(data)) {
        console.error('Doars: component tag must return an object!')
        return
      }

      // Create proxy dispatcher for state.
      proxy = new ProxyDispatcher()
      // Add data to dispatcher to create the state.
      state = proxy.add(data)

      // Scan for attributes.
      this.scanAttributes(element)
    }

    /**
     * Destroy the component.
     */
    this.destroy = () => {
      if (!isInitialized) {
        return
      }

      if (attributes.length > 0) {
        // Filter out directives without a destroy function.
        const directives = library.getDirectivesObject()
        for (const key in directives) {
          if (!directives[key].destroy) {
            directives[key] = undefined
          }
        }

        for (const attribute of attributes) {
          // Clean up attribute if the directive has a destroy function.
          const directive = directives[attribute.getKey()]
          if (directive) {
            directive.destroy(this, attribute, directiveUtilities)
          }

          // Destroy the attribute.
          attribute.destroy()
        }
      }

      // Remove reference from element.
      delete element[COMPONENT]

      // Reset variables.
      attributes = []

      // Set as not initialized.
      isInitialized = false

      // Remove state and state handling.
      proxy.remove(data)
      state = null
      proxy = null
      data = null

      // Store update triggers.
      const triggers = []

      // Set children as children of parent.
      if (children.length > 0) {
        for (const child of children) {
          // Set new parent of children.
          child.setParent(parent)

          // Add parent update trigger.
          triggers.push({
            id: child.getId(),
            path: 'parent',
          })
        }

        // Add children update trigger.
        triggers.push({
          id: id,
          path: 'children',
        })
      }
      if (parent) {
        if (children.length > 0) {
          // Add children to parent.
          parent.getChildren().push(...children)

          // Add children update trigger.
          triggers.push({
            id: parent.getId(),
            path: 'children',
          })
        }

        // Add parent update trigger.
        triggers.push({
          id: id,
          path: 'parent',
        })
      }

      // Dispatch triggers.
      if (triggers.length > 0) {
        library.update(triggers)
      }

      // Dispatch event.
      dispatchEvent('destroyed', {
        element: element,
        id: id,
      })
    }

    /**
     * Create and add an attribute. Assumes this attribute has not been added before.
     * @param {HTMLElement} element Attribute element.
     * @param {String} name Name of the attribute.
     * @param {String} value Value of the attribute.
     * @returns {Attribute} New attribute.
     */
    this.addAttribute = (element, name, value) => {
      // Get directive keys from library.
      const directivesKeys = library.getDirectivesNames()

      // Create and add attribute.
      const attribute = new Attribute(this, element, name, value)

      // Get index to add attribute at.
      let index = attribute.length
      const directiveIndex = directivesKeys.indexOf(attribute.getDirective())
      for (let i = attributes.length - 1; i >= 0; i--) {
        // If the other attribute is further down the keys list than add it after that item.
        if (directivesKeys.indexOf(attributes[i].getDirective()) <= directiveIndex) {
          index = i + 1
          break
        }
      }

      // Add to list of attributes.
      attributes.splice(index, 0, attribute)

      // Return new attribute.
      return attribute
    }

    /**
     * Remove an attribute.
     * @param {Attribute} attribute The attribute to remove.
     */
    this.removeAttribute = (attribute) => {
      // Get index of attribute in list.
      const indexInAttributes = attributes.indexOf(attribute)
      if (indexInAttributes < 0) {
        return
      }

      // Get directives.
      const directives = library.getDirectivesObject

      // Attribute has been removed, call the destroy directive.
      const directive = directives[attribute.getKey()]
      if (directive && directive.destroy) {
        directive.destroy(this, attribute, directiveUtilities)
      }

      // Remove attribute from list.
      attributes.splice(indexInAttributes, 1)

      // Destroy attribute.
      attribute.destroy()
    }

    /**
     * Scans element for new attributes. It assumes this element as not been read before and is part of the component.
     * @param {HTMLElement} element Element to scan.
     * @returns {Array<Attribute>} New attributes.
     */
    this.scanAttributes = (element) => {
      // Get component's state attribute.
      const componentName = prefix + '-state'
      const ignoreName = prefix + '-ignore'

      // Store new attributes.
      const newAttributes = []

      // Create iterator for walking over all elements in the component, skipping elements that are components or contain the ignore directive.
      const iterator = walk(element, (element) => !element.hasAttribute(componentName) && !element.hasAttribute(ignoreName))
      // Start on the given element then continue iterating over all children.
      do {
        for (const { name, value } of element.attributes) {
          // Skip attribute if it is not that of a directive.
          if (library.isDirectiveName(name)) {
            newAttributes.push(this.addAttribute(element, name, value))
          }
        }
      } while (element = iterator())

      // Return new attributes.
      return newAttributes
    }

    /**
     * Update an attribute.
     * @param {Attribute} attribute The attribute to update.
     */
    this.updateAttribute = (attribute) => {
      // Check if the attribute is still relevant, since the attribute or element could have been removed.
      if (!attribute.getElement() || attribute.getValue() === null || attribute.getValue() === undefined) {
        this.removeAttribute(attribute)
        return
      }

      // Get directives.
      const directives = library.getDirectivesObject()

      // Clear accessed.
      attribute.clearAccessed()

      // Process directive on attribute.
      const directive = directives[attribute.getDirective()]
      if (directive) {
        directive.update(this, attribute, directiveUtilities)
      }
    }

    /**
     * Update the specified attributes of the component.
     * @param {Array<Attribute>} attributes Attributes to update.
     */
    this.updateAttributes = (attributes) => {
      if (!isInitialized || attributes.length <= 0) {
        if (!hasUpdated) {
          // Dispatch updated event anyway.
          hasUpdated = true
          dispatchEvent('updated', {
            attributes: attributes,
            element: element,
            id: id,
          })
        }
        return
      }

      for (const attribute of attributes) {
        this.updateAttribute(attribute)
      }

      // Dispatch updated event.
      hasUpdated = true
      dispatchEvent('updated', {
        attributes: attributes,
        element: element,
        id: id,
      })
    }

    /**
     * Start updating the component's attributes.
     * @param {Array<Object>} triggers List of triggers.
     */
    this.update = (triggers) => {
      if (!isInitialized) {
        return
      }

      // Get all ids of triggers.
      const triggerIds = Object.getOwnPropertySymbols(triggers)

      // Update all attributes whose accessed items match any update trigger.
      const updatedAttributes = []
      for (const attribute of attributes) {
        for (const id of triggerIds) {
          if (attribute.hasAccessed(id, triggers[id])) {
            this.updateAttribute(attribute)
            updatedAttributes.push(attribute)
          }
        }
      }

      // Dispatch updated event.
      if (!hasUpdated || updatedAttributes.length > 0) {
        hasUpdated = true
        dispatchEvent('updated', {
          attributes: updatedAttributes,
          element: element,
          id: id,
        })
      }
    }

    /**
     * Dispatch an event from this component.
     * @param {String} name Name of the event.
     */
    const dispatchEvent = (name, detail) => {
      element.dispatchEvent(
        new CustomEvent(prefix + '-' + name, {
          detail: detail,
          bubbles: true,
        })
      )
    }
  }
}
