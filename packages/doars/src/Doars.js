// Import symbols.
import { ATTRIBUTES, COMPONENT } from './symbols.js'

// Import classes.
import Component from './Component.js'

// Import contexts.
import contextChildren from './contexts/children.js'
import contextComponent from './contexts/component.js'
import contextElement from './contexts/element.js'
import contextDispatch from './contexts/dispatch.js'
import contextFor from './contexts/for.js'
import contextInContext from './contexts/inContext.js'
import contextNextTick from './contexts/nextTick.js'
import contextParent from './contexts/parent.js'
import contextReferences from './contexts/references.js'
import contextState from './contexts/state.js'

// Import directives.
import directiveAttribute from './directives/attribute.js'
import directiveCloak from './directives/cloak.js'
import directiveFor from './directives/for.js'
import directiveHtml from './directives/html.js'
import directiveIf from './directives/if.js'
import directiveInitialized from './directives/initialized.js'
import directiveOn from './directives/on.js'
import directiveReference from './directives/reference.js'
import directiveSelect from './directives/select.js'
import directiveShow from './directives/show.js'
import directiveSync from './directives/sync.js'
import directiveText from './directives/text.js'
import directiveWatch from './directives/watch.js'

// Import event dispatcher.
import EventDispatcher from './events/EventDispatcher.js'

// Import utils.
import { closestComponent } from './utils/ComponentUtils.js'
import { walk } from './utils/ElementUtils.js'

export default class Doars extends EventDispatcher {
  /**
   * Create instance.
   * @param {Object} options Options.
   */
  constructor(options) {
    super()

    // Deconstruct options.
    let { prefix, root } = options = Object.assign({
      prefix: 'd',
      processor: 'execute',
      root: document.body.firstElementChild,
    }, options)
    // If root is a string assume it is a selector.
    if (typeof (root) === 'string') {
      options.root = root = document.querySelector(root)
    }
    // Validate options.
    if (process.env.NODE_ENV === 'development') {
      if (!prefix) {
        console.error('Doars: `prefix` option not set.')
        return
      }
      if (typeof (prefix) !== 'string') {
        console.error('Doars: `prefix` option must be of type string.')
        return
      }
      if (!root) {
        console.error('Doars: `root` option not set.')
        return
      }
      if (typeof (root) !== 'object') {
        console.error('Doars: `root` option must be a string or HTMLElement.')
        return
      }
    }

    // Create unique identifier.
    const id = Symbol('ID_DOARS')

    // Create private variables.
    let isEnabled = false, isUpdating = false, mutations, observer, triggers

    const components = []
    const contextsBase = {}, contexts = [
      contextChildren,
      contextComponent,
      contextElement,
      contextDispatch,
      contextInContext,
      contextNextTick,
      contextParent,
      contextReferences,

      // Order of `state` before `for` context is important for deconstruction.
      contextState,
      contextFor,
    ]
    const directives = [
      // Must happen first as other directives can rely on it.
      directiveReference,

      // Then execute those that modify the document tree, since it could make other directives redundant and save on processing.
      directiveAttribute,
      directiveFor,
      directiveHtml,
      directiveIf,
      directiveText,

      // Order does not matter any more.
      directiveCloak,
      directiveInitialized,
      directiveOn,
      directiveSelect,
      directiveShow,
      directiveSync,
      directiveWatch,
    ]
    let directivesNames, directivesObject, directivesRegexp

    /**
     * Get the unique identifier.
     * @returns {Symbol} Unique identifier.
     */
    this.getId = () => {
      return id
    }

    /**
     * Get the current options.
     * @returns {Object} Current options.
     */
    this.getOptions = () => {
      return Object.assign({}, options)
    }

    /* State */

    /**
     * Whether this is currently enabled.
     * @returns {Boolean} Whether the library is enabled.
     */
    this.getEnabled = () => {
      return isEnabled
    }

    /**
     * Enable the library.
     * @returns {Doars} This instance.
     */
    this.enable = () => {
      if (isEnabled) {
        return this
      }

      // Setup values.
      isUpdating = false
      mutations = []
      triggers = {}

      // Dispatch event.
      this.dispatchEvent('enabling', [this])

      // Mark as enabled.
      isEnabled = true

      // Create list of directive names.
      directivesNames = directives.map((directive) => directive.name)

      // Create directives object.
      directivesObject = {}
      for (const directive of directives) {
        directivesObject[directive.name] = directive
      }

      // Dynamically create expression for matching any attribute names to known directive keys.
      directivesRegexp = new RegExp('^' + prefix + '-(' + directivesNames.join('|') + ')(?:[$-_.a-z0-9]{0,})?$', 'i') // eslint-disable-line prefer-regex-literals

      // Create mutation observer.
      observer = new MutationObserver((handleMutation).bind(this))
      observer.observe(root, {
        attributes: true,
        childList: true,
        subtree: true,
      })

      // Scan for components.
      const componentName = prefix + '-state'
      const ignoreName = prefix + '-ignore'
      const componentElements = [...root.querySelectorAll('[' + componentName + ']')]
      // Remove any elements that should be ignored.
      for (let i = componentElements.length - 1; i >= 0; i--) {
        if (componentElements[i].closest('[' + ignoreName + ']')) {
          componentElements.splice(i, 1)
        }
      }
      addComponents((root.hasAttribute(componentName) && !root.hasAttribute(ignoreName)) ? root : null, ...componentElements)

      // Dispatch events.
      this.dispatchEvent('enabled', [this])
      this.dispatchEvent('updated', [this])

      return this
    }

    /**
     * Disable the library.
     * @returns {Doars} This instance.
     */
    this.disable = () => {
      if (!isEnabled) {
        return this
      }

      // Disable mutation observer.
      observer.disconnect()
      observer = null

      // Reset values.
      isUpdating = mutations = triggers = null

      // Dispatch event.
      this.dispatchEvent('disabling', [this], { reverse: true })

      // Remove components.
      removeComponents(...components)

      // Reset directives helper.
      directivesNames = directivesObject = directivesRegexp = null

      // Mark as disabled.
      isEnabled = false

      // Dispatch event.
      this.dispatchEvent('disabled', [this], { reverse: true })

      return this
    }

    /* Components */

    /**
     * Add components to instance.
     * @param  {...HTMLElement} elements Elements to add as components.
     * @returns {Array<Component>} List of added components.
     */
    const addComponents = (...elements) => {
      const results = []
      const resultElements = []
      for (const element of elements) {
        if (!element) {
          continue
        }

        // Skip if already a component.
        if (element[COMPONENT]) {
          continue
        }

        // Create component.
        const component = new Component(this, element)
        // Add to list.
        components.push(component)

        // Add to results.
        results.push(component)
        resultElements.push(element)
      }

      if (resultElements.length > 0) {
        // Dispatch event.
        this.dispatchEvent('components-added', [this, resultElements])
      }

      // Initialize new components.
      for (const component of results) {
        component.initialize()
      }

      // Update all attributes on new components.
      for (const component of results) {
        component.updateAttributes(component.getAttributes())
      }

      return results
    }

    /**
     * Remove components from instance.
     * @param  {...Component} components Component to remove.
     * @returns {Array<HTMLElement>} List of elements of removed components.
     */
    const removeComponents = (..._components) => {
      const results = []
      for (const component of _components) {
        // Skip if not in list.
        const index = components.indexOf(component)
        if (index < 0) {
          continue
        }

        // Add to results.
        results.push(component.getElement())

        // Destroy component.
        component.destroy()
        // Remove from list.
        components.splice(index, 1)
      }

      if (results.length > 0) {
        // Dispatch event.
        this.dispatchEvent('components-removed', [this, results])
      }

      return results
    }

    /* Simple contexts */

    /**
     * Get simple contexts.
     * @returns {Object} Stored simple contexts.
     */
    this.getSimpleContexts = () => Object.assign({}, contextsBase)

    /**
     * Add a value directly to the contexts without needing to use an object or having to deal with indices.
     * @param {String} name Property name under which to add the context.
     * @param {Any} value The value to add, null removes the context.
     * @returns {Boolean} Whether the value was successfully set.
     */
    this.setSimpleContext = (name, value = null) => {
      // Delete context if value is null.
      if (value === null) {
        delete contextsBase[name]

        // Dispatch event.
        this.dispatchEvent('simple-context-removed', [this, name])
        return true
      }

      // Validate name.
      if (!name.match('^([a-zA-Z_$][a-zA-Z\d_$]*)$')) {
        console.warn('Doars: name of a bind can not start with a "$".')
        return false
      }

      // Store value on contexts base.
      contextsBase[name] = value

      // Dispatch event.
      this.dispatchEvent('simple-context-added', [this, name, value])

      return true
    }

    /* Contexts */

    /**
     * Get list contexts.
     * @returns {Array<Object>} List of contexts.
     */
    this.getContexts = () => [...contexts]

    /**
     * Add contexts at the index. *Can only be called when NOT enabled.*
     * @param {Number} index Index to start adding at.
     * @param {...Object} _contexts List of contexts to add.
     * @returns {Array<Object>} List of added contexts.
     */
    this.addContexts = (index, ..._contexts) => {
      if (isEnabled) {
        console.warn('Doars: Unable to add contexts after being enabled!')
        return
      }

      if (index < 0) {
        index = contexts.length + (index % contexts.length)
      } else if (index > contexts.length) {
        index = contexts.length
      }

      const results = []
      for (let i = 0; i < _contexts.length; i++) {
        // Get context from list.
        const context = _contexts[i]

        // Skip if already in list.
        if (contexts.includes(context)) {
          continue
        }

        // Add to list.
        contexts.splice(index + i, 0, context)

        // Add to results.
        results.push(context)
      }

      if (results.length > 0) {
        // Dispatch event.
        this.dispatchEvent('contexts-added', [this, results])
      }

      return results
    }

    /**
     * Remove contexts. *Can only be called when NOT enabled.*
     * @param {...Object} _contexts List of contexts to remove.
     * @returns {Array<Object>} List of removed contexts.
     */
    this.removeContexts = (..._contexts) => {
      if (isEnabled) {
        console.warn('Doars: Unable to remove contexts after being enabled!')
        return
      }

      const results = []
      for (const context of _contexts) {
        // Skip if not in list.
        const index = contexts.indexOf(context)
        if (index < 0) {
          continue
        }

        // Remove from list.
        contexts.slice(index, 1)

        // Add to results.
        results.push(context)
      }

      if (results.length > 0) {
        // Dispatch event.
        this.dispatchEvent('contexts-removed', [this, results])
      }

      return results
    }

    /* Directives */

    /**
     * Get list directives.
     * @returns {Array<Object>} List of directives.
     */
    this.getDirectives = () => [...directives]

    /**
     * Get list of directive names.
     * @returns {Array<String>} List of directive names.
     */
    this.getDirectivesNames = () => [...directivesNames]

    /**
     * Get object of directives with the directive name as key.
     * @returns {Object} Object of directives.
     */
    this.getDirectivesObject = () => Object.assign({}, directivesObject)

    /**
     * Check whether a name matches that of a directive.
     * @param {String} attributeName Name of the attribute to match.
     * @returns {Boolean} Whether the name matches that of a directive.
     */
    this.isDirectiveName = (attributeName) => directivesRegexp.test(attributeName)

    /**
     * Add directives at the index. *Can only be called when NOT enabled.*
     * @param {Number} index Index to start adding at.
     * @param  {...Object} _directives List of directives to add.
     * @returns {Array<Object>} List of added directives.
     */
    this.addDirectives = (index, ..._directives) => {
      if (isEnabled) {
        console.warn('Doars: Unable to add directives after being enabled!')
        return
      }

      if (index < 0) {
        index = directives.length + (index % directives.length)
      } else if (index > directives.length) {
        index = directives.length
      }

      const results = []
      for (let i = 0; i < _directives.length; i++) {
        // Get directive from list.
        const directive = _directives[i]

        // Skip if already in list.
        if (directives.includes(directive)) {
          continue
        }

        // Add to list.
        directives.splice(index + i, 0, directive)

        // Add to results.
        results.push(directive)
      }

      if (results.length > 0) {
        // Reset directives helpers.
        directivesNames = directivesObject = directivesRegexp = null

        // Dispatch event.
        this.dispatchEvent('directives-added', [this, results])
      }

      return results
    }

    /**
     * Remove directives. *Can only be called when NOT enabled.*
     * @param  {...Object} _directives List of directives to remove.
     * @returns {Array<Object>} List of removed directives.
     */
    this.removeDirectives = (..._directives) => {
      if (isEnabled) {
        console.warn('Doars: Unable to remove directives after being enabled!')
        return
      }

      const results = []
      for (const directive of _directives) {
        // Skip if not in list.
        const index = directives.indexOf(directive)
        if (index < 0) {
          continue
        }

        // Remove from list.
        directives.slice(index, 1)

        // Add to results
        results.push(directive)
      }

      if (results.length > 0) {
        // Reset directives helpers.
        directivesNames = directivesObject = directivesRegexp = null

        // Dispatch event.
        this.dispatchEvent('directives-removed', [this, results])
      }

      return results
    }

    /* Update */

    /**
     * Update directives based on triggers. *Can only be called when enabled.*
     * @param {Array<Object>} _triggers List of triggers to update with.
     */
    this.update = (_triggers) => {
      if (!isEnabled) {
        // Exit early since it needs to enabled first.
        return
      }

      if (_triggers) {
        // Add new triggers to existing triggers.
        for (const trigger of _triggers) {
          // Deconstruct new trigger.
          const { id, path } = trigger

          // Create list at id if not already there.
          if (!(id in triggers)) {
            triggers[id] = [
              path,
            ]
            continue
          }

          // Add path to list at id.
          if (!triggers[id].includes(path)) {
            triggers[id].push(path)
          }
        }
      }

      // Don't update while another update is going on.
      if (isUpdating) {
        return
      }

      // Check if there is something to update.
      if (Object.getOwnPropertySymbols(triggers).length === 0) {
        return
      }

      // Set as updating.
      isUpdating = true

      // Move update triggers to local scope only.
      _triggers = triggers
      triggers = {}

      // Update each component and collect any triggers.
      for (const component of components) {
        component.update(_triggers)
        // If this ever needs to be done in hierarchical order try the following. Go over each component and check if its parent is further down in the list. If so place the component directly after the parent. Then continue iteration over the components. This sorting only has to happen when a component is added to or moved in the hierarchy.
      }

      // Set as NOT updating.
      isUpdating = false

      // If there are triggers again then update again.
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        console.warn('Doars: during an update another update has been triggered. Normally this should not happen unless an expression in one of the directives is modifying a state which could cause a infinite loop!')
        // Use an animation frame to delay the update to prevent freezing.
        window.requestAnimationFrame(() => this.update())
        return
      }

      // If there are any mutation to handle then handle them.
      if (mutations.length > 0) {
        handleMutation()
        return
      }

      this.dispatchEvent('updated', [this])
    }

    /**
     * Handle document mutations by update internal data and executing directives.
     * @param {Array<MutationRecord>} newMutations List of mutations.
     */
    const handleMutation = (newMutations) => {
      // Add mutations to existing list.
      mutations.push(...newMutations)

      // Don't handle mutations while an update is going on.
      if (isUpdating) {
        return
      }

      // Check if there are any mutations to handle.
      if (mutations.length === 0) {
        return
      }

      // Set as updating.
      isUpdating = true

      // Get mutations to handle.
      newMutations = [...mutations]
      mutations = []

      // Construct component name.
      const componentName = prefix + '-state'
      const ignoreName = prefix + '-ignore'

      // Store new attribute and elements that define new components.
      const componentsToAdd = []
      const componentsToRemove = []

      const remove = (element) => {
        // Skip if not an element.
        if (element.nodeType !== 1) {
          return
        }

        // Check if element is a component itself.
        if (element[COMPONENT]) {
          // Add component to remove list.
          componentsToRemove.unshift(element[COMPONENT])
          // Scan for more components inside this.
          const componentElements = element.querySelectorAll(componentName)
          for (const componentElement of componentElements) {
            if (componentElement[COMPONENT]) {
              componentsToRemove.unshift(componentElement)
            }
          }
        } else {
          // Create iterator for walking over all elements in the component, skipping elements that are components and adding those to the remove list.
          const iterator = walk(element, (element) => {
            if (element[COMPONENT]) {
              componentsToRemove.unshift(element[COMPONENT])
              return false
            }
            return true
          })
          do {
            // Check if element has attributes.
            if (!element[ATTRIBUTES]) {
              continue
            }

            // Remove attributes from their component.
            for (const attribute of element[ATTRIBUTES]) {
              attribute.getComponent().removeAttribute(attribute)
            }
          } while (element = iterator())
        }
      }
      const add = (element) => {
        // Skip if not an element.
        if (element.nodeType !== 1) {
          return
        }

        // Skip if inside an ignore tag.
        const ignoreParent = element.closest('[' + ignoreName + ']')
        if (ignoreParent) {
          return
        }

        // Scan for new components and add them to the list.
        const componentElements = element.querySelectorAll('[' + componentName + ']')
        for (const componentElement of componentElements) {
          // Skip if inside an ignore tag.
          const ignoreParent = componentElement.closest('[' + ignoreName + ']')
          if (ignoreParent) {
            continue
          }

          componentsToAdd.push(componentElement)
        }

        // Check if this elements defines a new component.
        if (element.hasAttribute(componentName)) {
          // Store new component element and exit early.
          componentsToAdd.push(element)
          return
        }

        // Find nearest component.
        const component = closestComponent(element)
        if (component) {
          // Scan for and update new attributes.
          const attributes = component.scanAttributes(element)
          component.updateAttributes(attributes)
        }
      }

      // Iterate over mutations.
      for (const mutation of newMutations) {
        if (mutation.type === 'childList') {
          // Iterate over removed elements.
          for (const element of mutation.removedNodes) {
            remove(element)
          }

          // Iterate over added elements.
          for (const element of mutation.addedNodes) {
            add(element)
          }
        } else if (mutation.type === 'attributes') {
          const element = mutation.target
          // Check if new component is defined.
          if (mutation.attributeName === componentName) {
            // If a component is already defined ignore the change.
            if (element[COMPONENT]) {
              continue
            }

            // Get nearest component, this will become the parent.
            const component = closestComponent(element)
            if (component) {
              // Remove attributes part of nearest component, that will become part of the new component.
              let currentElement = element
              const iterator = walk(element, (element) => element.hasAttribute(componentName))
              do {
                for (const attribute of currentElement[ATTRIBUTES]) {
                  component.removeAttribute(attribute)
                }
              } while (currentElement = iterator())
            }

            // Add new component.
            addComponents(element)
            continue
          } else if (mutation.attributeName === ignoreName) {
            if (element.hasAttribute(ignoreName)) {
              // Remove everything inside.
              remove(element)
              continue
            }

            // Add everything inside.
            add(element)
            continue
          }

          // Check if a directive is added.
          if (!directivesRegexp.test(mutation.attributeName)) {
            continue
          }

          // Get component of mutated element.
          const component = closestComponent(element)
          if (!component) {
            continue
          }

          // Get attribute from component and value from element.
          let attribute = null
          for (const targetAttribute of element[ATTRIBUTES]) {
            if (targetAttribute.getName() === mutation.attributeName) {
              attribute = targetAttribute
              break
            }
          }
          const value = element.getAttribute(mutation.attributeName)

          // If no attribute found add it.
          if (!attribute) {
            if (value) {
              component.addAttribute(element, mutation.attributeName, value)
            }
            continue
          }

          // Update attribute.
          attribute.setValue(value)
          component.updateAttribute(attribute)
        }
      }

      // Remove old components.
      if (componentsToRemove.length > 0) {
        removeComponents(...componentsToRemove)
      }
      // Add new components.
      if (componentsToAdd.length > 0) {
        addComponents(...componentsToAdd)
      }

      // Set as NOT updating.
      isUpdating = false

      // If there are any mutation to handle then handle them.
      if (mutations.length > 0) {
        handleMutation()
        return
      }

      // If there are any triggers then trigger an update.
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        this.update()
      }
    }
  }
}
