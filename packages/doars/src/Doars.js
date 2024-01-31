// Import symbols.
import { ATTRIBUTES, COMPONENT } from './symbols.js'

// Import classes.
import Component from './Component.js'

// Import contexts.
import createChildrenContext from './contexts/children.js'
import createComponentContext from './contexts/component.js'
import createElementContext from './contexts/element.js'
import createDispatchContext from './contexts/dispatch.js'
import createForContext from './contexts/for.js'
import createInContextContext from './contexts/inContext.js'
import createNextSiblingContext from './contexts/nextSibling.js'
import createNextTickContext from './contexts/nextTick.js'
import createParentContext from './contexts/parent.js'
import createPreviousSiblingContext from './contexts/previousSibling.js'
import createReferencesContext from './contexts/references.js'
import createSiblingsContext from './contexts/siblings.js'
import createStateContext from './contexts/state.js'
import createStoreContext from './contexts/store.js'
import createWatchContext from './contexts/watch.js'

// Import directives.
import createAttributeDirective from './directives/attribute.js'
import createCloakDirective from './directives/cloak.js'
import createForDirective from './directives/for.js'
import createHtmlDirective from './directives/html.js'
import createIfDirective from './directives/if.js'
import createInitializedDirective from './directives/initialized.js'
import createOnDirective from './directives/on.js'
import createReferenceDirective from './directives/reference.js'
import createSelectDirective from './directives/select.js'
import createShowDirective from './directives/show.js'
import createSyncDirective from './directives/sync.js'
import createTextDirective from './directives/text.js'
import createWatchDirective from './directives/watch.js'

// Import event dispatcher.
import EventDispatcher from '@doars/common/src/events/EventDispatcher.js'

// Import utilities.
import { closestComponent } from './utilities/Component.js'
import { walk } from '@doars/common/src/utilities/Element.js'

/**
 * @typedef {import('./Attribute.js').default} Attribute
 * @typedef {import('./Context.js').Context} Context
 * @typedef {import('./Directive.js').Directive} Directive
 */

/**
 * @callback ExpressionProcessor Executes value in the correct context.
 * @param {Component} component Instance of the component.
 * @param {Attribute} attribute Instance of the attribute.
 * @param {string} expression Expression to execute.
 * @param {object|null} extra Optional extra context items.
 * @param {object|null} options Optional options object.
 * @returns {any} Result of expression.
 */

/**
 * @typedef {{[key:string]:Directive}} ContextMap Object that maps names of contexts to the context.
 */
/**
 * @typedef {{[key:string]:Directive}} DirectiveMap Object that maps names of directives to the directive.
 */

/**
 * @typedef Trigger
 * @type {object}
 * @property {string|symbol} id The identifier of the changed resource.
 * @property {string} path The path leading to the changed value on the resource.
 */

/**
 * @typedef _DoarsOptions
 * @type {object}
 * @property {?string} prefix The prefix of the directive's attribute names.
 * @property {?string} processor The expression processor to use.
 * @property {?HTMLElement|string} root The element or selector of an element to scan and keep track of.
 * @property {?boolean} allowInlineScript When setting the innerHTML or outerHTML inline scripts are not automatically ran. Enabling this wil ensure the inline scripts are executed.
 * @property {?boolean} forContextDeconstruct Whether to require the `$for` prefix when trying to accessing data from the for context.
 * @property {?boolean} stateContextDeconstruct Whether to require the `$state` prefix when trying to accessing data from the state context.
 * @property {?boolean} storeContextDeconstruct Whether to require the `$store` prefix when trying to accessing data from the store context.
 * @property {?object} storeContextInitial The initial data of the data store context.
 * @property {?boolean} indicatorDirectiveEvaluate If set to false the indicator directive's value is read as a string literal instead of an expression to process.
 * @property {?boolean} referenceDirectiveEvaluate If set to false the reference directive's value is read as a string literal instead of an expression to process.
 * @property {?boolean} selectFromElementDirectiveEvaluate If set to false the select from element directive's value is read as a string literal instead of an expression to process.
 * @property {?boolean} targetDirectiveEvaluate If set to false the target directive's value is read as a string literal instead of an expression to process.
 * @property {?string} childrenContextName The name of the children context.
 * @property {?string} componentContextName The name of the component context.
 * @property {?string} dispatchContextName The name of the dispatch context.
 * @property {?string} elementContextName The name of the element context.
 * @property {?string} forContextName The name of the for context.
 * @property {?string} inContextContextName The name of the inContext context.
 * @property {?string} nextSiblingContextName The name of the next sibling context.
 * @property {?string} nextTickContextName The name of the nextTick context.
 * @property {?string} parentContextName The name of the parent context.
 * @property {?string} previousSiblingContextName The name of the previous sibling context.
 * @property {?string} referencesContextName The name of the references context.
 * @property {?string} siblingsContextName The name of the siblings context.
 * @property {?string} stateContextName The name of the state context.
 * @property {?string} storeContextName The name of the store context.
 * @property {?string} watchContextName The name of the watch context.
 * @property {?string} attributeDirectiveName The name of the attribute directive.
 * @property {?string} cloakDirectiveName The name of the cloak directive.
 * @property {?string} forDirectiveName The name of the for directive.
 * @property {?string} htmlDirectiveName The name of the html directive.
 * @property {?string} ifDirectiveName The name of the if directive.
 * @property {?string} ignoreDirectiveName The name of the ignore directive.
 * @property {?string} indicatorDirectiveName The name of the indicator directive.
 * @property {?string} initializedDirectiveName The name of the initialized directive.
 * @property {?string} onDirectiveName The name of the on directive.
 * @property {?string} referenceDirectiveName The name of the reference directive.
 * @property {?string} selectDirectiveName The name of the select directive.
 * @property {?string} selectFromElementDirectiveName The name of the select from element directive.
 * @property {?string} showDirectiveName The name of the show directive.
 * @property {?string} stateDirectiveName The name of the state directive.
 * @property {?string} syncDirectiveName The name of the sync directive.
 * @property {?string} targetDirectiveName The name of the target directive.
 * @property {?string} textDirectiveName The name of the text directive.
 * @property {?string} transitionDirectiveName The name of the transition directive.
 * @property {?string} watchDirectiveName The name of the watch directive.
 * @property {?string} redirectHeaderName The name of the redirect header.
 * @property {?string} requestHeaderName The name of the request header.
 * @property {?string} titleHeaderName The name of the title header.
 */

/**
 * @typedef DoarsOptions
 * @type {object}
 * @property {string} prefix The prefix of the directive's attribute names.
 * @property {string} processor The expression processor to use.
 * @property {HTMLElement|string} root The element or selector of an element to scan and keep track of.
 * @property {boolean} allowInlineScript When setting the innerHTML or outerHTML inline scripts are not automatically ran. Enabling this wil ensure the inline scripts are executed.
 * @property {boolean} forContextDeconstruct Whether to require the `$for` prefix when trying to accessing data from the for context.
 * @property {boolean} stateContextDeconstruct Whether to require the `$state` prefix when trying to accessing data from the state context.
 * @property {boolean} storeContextDeconstruct Whether to require the `$store` prefix when trying to accessing data from the store context.
 * @property {object} storeContextInitial The initial data of the data store context.
 * @property {boolean} indicatorDirectiveEvaluate If set to false the indicator directive's value is read as a string literal instead of an expression to process.
 * @property {boolean} referenceDirectiveEvaluate If set to false the reference directive's value is read as a string literal instead of an expression to process.
 * @property {boolean} selectFromElementDirectiveEvaluate If set to false the select from element directive's value is read as a string literal instead of an expression to process.
 * @property {boolean} targetDirectiveEvaluate If set to false the target directive's value is read as a string literal instead of an expression to process.
 * @property {string} childrenContextName The name of the children context.
 * @property {string} componentContextName The name of the component context.
 * @property {string} dispatchContextName The name of the dispatch context.
 * @property {string} elementContextName The name of the element context.
 * @property {string} forContextName The name of the for context.
 * @property {string} inContextContextName The name of the inContext context.
 * @property {string} nextSiblingContextName The name of the next sibling context.
 * @property {string} nextTickContextName The name of the nextTick context.
 * @property {string} parentContextName The name of the parent context.
 * @property {string} previousSiblingContextName The name of the previous sibling context.
 * @property {string} referencesContextName The name of the references context.
 * @property {string} siblingsContextName The name of the siblings context.
 * @property {string} stateContextName The name of the state context.
 * @property {string} storeContextName The name of the store context.
 * @property {string} watchContextName The name of the watch context.
 * @property {string} attributeDirectiveName The name of the attribute directive.
 * @property {string} cloakDirectiveName The name of the cloak directive.
 * @property {string} forDirectiveName The name of the for directive.
 * @property {string} htmlDirectiveName The name of the html directive.
 * @property {string} ifDirectiveName The name of the if directive.
 * @property {string} ignoreDirectiveName The name of the ignore directive.
 * @property {string} indicatorDirectiveName The name of the indicator directive.
 * @property {string} initializedDirectiveName The name of the initialized directive.
 * @property {string} onDirectiveName The name of the on directive.
 * @property {string} referenceDirectiveName The name of the reference directive.
 * @property {string} selectDirectiveName The name of the select directive.
 * @property {string} selectFromElementDirectiveName The name of the select from element directive.
 * @property {string} showDirectiveName The name of the show directive.
 * @property {string} stateDirectiveName The name of the state directive.
 * @property {string} syncDirectiveName The name of the sync directive.
 * @property {string} targetDirectiveName The name of the target directive.
 * @property {string} textDirectiveName The name of the text directive.
 * @property {string} transitionDirectiveName The name of the transition directive.
 * @property {string} watchDirectiveName The name of the watch directive.
 * @property {string} redirectHeaderName The name of the redirect header.
 * @property {string} requestHeaderName The name of the request header.
 * @property {string} titleHeaderName The name of the title header.
 */

export default class Doars extends EventDispatcher {
  /**
   * Create instance.
   * @param {_DoarsOptions} options Options.
   */
  constructor(
    options,
  ) {
    super()

    // Deconstruct options.
    let {
      prefix,
      processor,
      root,
    } = options = Object.freeze(Object.assign({
      prefix: 'd',
      processor: 'execute',
      root: document.body,

      allowInlineScript: false,
      forContextDeconstruct: true,
      stateContextDeconstruct: true,
      storeContextDeconstruct: false,
      storeContextInitial: {},
      indicatorDirectiveEvaluate: true,
      referenceDirectiveEvaluate: true,
      selectFromElementDirectiveEvaluate: true,
      targetDirectiveEvaluate: true,

      // Context names must pass regex: /^[_$a-z]{1}[_$a-z0-9]{0,}$/i.test(name)
      childrenContextName: '$children',
      componentContextName: '$component',
      dispatchContextName: '$dispatch',
      elementContextName: '$element',
      forContextName: '$for',
      inContextContextName: '$inContext',
      nextSiblingContextName: '$nextSibling',
      nextTickContextName: '$nextTick',
      parentContextName: '$parent',
      previousSiblingContextName: '$previousSibling',
      referencesContextName: '$references',
      siblingsContextName: '$siblings',
      stateContextName: '$state',
      storeContextName: '$store',
      watchContextName: '$watch',

      // Directive names must pass regex: /^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(name)
      attributeDirectiveName: 'attribute',
      cloakDirectiveName: 'cloak',
      forDirectiveName: 'for',
      htmlDirectiveName: 'html',
      ifDirectiveName: 'if',
      ignoreDirectiveName: 'ignore',
      indicatorDirectiveName: 'indicator',
      initializedDirectiveName: 'initialized',
      onDirectiveName: 'on',
      referenceDirectiveName: 'reference',
      selectDirectiveName: 'select',
      selectFromElementDirectiveName: 'select',
      showDirectiveName: 'show',
      stateDirectiveName: 'state',
      syncDirectiveName: 'sync',
      targetDirectiveName: 'target',
      textDirectiveName: 'text',
      transitionDirectiveName: 'transition',
      watchDirectiveName: 'watch',

      // Header names must pass regex: /^[_\-$a-z]{1}[_\-$a-z0-9]{0,}$/i.test(name)
      redirectHeaderName: 'redirect',
      requestHeaderName: 'request',
      titleHeaderName: 'title',
    }, options))
    // If root is a string assume it is a selector.
    if (typeof (root) === 'string') {
      root = options.root = document.querySelector(root)
    }
    // Validate options.
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

    // Create unique identifier.
    const id = Symbol('ID_DOARS')

    // Create private variables.
    let isEnabled = false,
      isUpdating = false,
      mutations,
      observer,
      triggers

    /** @type {Array<Component>} */
    const components = []
    const
      contextsBase = {},
      contexts = [
        createChildrenContext(options),
        createComponentContext(options),
        createElementContext(options),
        createDispatchContext(options),
        createInContextContext(options),
        createNextSiblingContext(options),
        createNextTickContext(options),
        createParentContext(options),
        createPreviousSiblingContext(options),
        createReferencesContext(options),
        createSiblingsContext(options),
        createWatchContext(options),

        // Order of `store`, `state` and `for` context is important for deconstruction.
        createStoreContext(options),
        createStateContext(options),
        createForContext(options),
      ]
    const directives = [
      // Must happen first as other directives can rely on it.
      createReferenceDirective(options),

      // Then execute those that modify the document tree, since it could make other directives redundant and save on processing.
      createAttributeDirective(options),
      createForDirective(options),
      createHtmlDirective(options),
      createIfDirective(options),
      createTextDirective(options),

      // Order does not matter any more.
      createCloakDirective(options),
      createInitializedDirective(options),
      createOnDirective(options),
      createSelectDirective(options),
      createShowDirective(options),
      createSyncDirective(options),
      createWatchDirective(options),
    ]
    let directivesNames,
      directivesObject,
      directivesRegexp

    // Get the expression processor.
    const processorType = typeof (processor)
    let processExpression
    if (processorType === 'function') {
      processExpression = processor
    } else if (processorType === 'string' && this.constructor[processor + 'Expression']) {
      processExpression = this.constructor[processor + 'Expression']
    } else {
      console.warn('Doars: Expression processor not found. Using fallback instead.')
      processExpression = this.constructor.executeExpression ?? this.constructor.interpretExpression ?? this.constructor.callExpression
    }
    if (!processExpression) {
      console.error('Doars: No expression processor available. Process option: ', process)
    }

    /**
     * Get the unique identifier.
     * @returns {symbol} Unique identifier.
     */
    this.getId = (
    ) => {
      return id
    }

    /**
     * Get the current options.
     * @returns {DoarsOptions} Current options.
     */
    this.getOptions = (
    ) => {
      return Object.assign({}, options)
    }

    /* State */

    /**
     * Whether this is currently enabled.
     * @returns {boolean} Whether the library is enabled.
     */
    this.getEnabled = (
    ) => {
      return isEnabled
    }

    /**
     * Enable the library.
     * @returns {Doars} This instance.
     */
    this.enable = (
    ) => {
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

      const {
        stateDirectiveName,
        ignoreDirectiveName,
      } = this.getOptions()

      // Scan for components.
      const componentName = prefix + '-' + stateDirectiveName
      const ignoreName = prefix + '-' + ignoreDirectiveName
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
    this.disable = (
    ) => {
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
    const addComponents = (
      ...elements
    ) => {
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
     * @param  {...Component} _components Components to remove.
     * @returns {Array<HTMLElement>} List of elements of removed components.
     */
    const removeComponents = (
      ..._components
    ) => {
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
     * @returns {ContextMap} Stored simple contexts.
     */
    this.getSimpleContexts = (
    ) => Object.assign({}, contextsBase)

    /**
     * Add a value directly to the contexts without needing to use an object or having to deal with indices.
     * @param {string} name Property name under which to add the context.
     * @param {Context} value The value to add, null removes the context.
     * @returns {boolean} Whether the value was successfully set.
     */
    this.setSimpleContext = (
      name,
      value = null,
    ) => {
      // Delete context if value is null.
      if (value === null) {
        delete contextsBase[name]

        // Dispatch event.
        this.dispatchEvent('simple-context-removed', [this, name])
        return true
      }

      // Validate name.
      if (!name.match('^([a-zA-Z_$][a-zA-Z\\d_$]*)$')) {
        console.warn('Doars: name of a bind can not start with a "$".')
        return false
      }

      // Store value on contexts base.
      contextsBase[name] = value

      // Dispatch event.
      this.dispatchEvent('simple-context-added', [this, name, value])

      return true
    }

    /**
     * Adds simple contexts by looping through the object and calling the the setSimpleContext function with the data.
     * @param {Array<Context>} contexts An object where the key is the name for the simple context and the value the simple context.
     * @returns {Array<Context>} Which simple context was successfully set.
     */
    this.setSimpleContexts = (
      contexts,
    ) => {
      const result = {}
      for (const name in contexts) {
        if (Object.hasOwnProperty.call(contexts, name)) {
          result[name] = this.setSimpleContext(name, contexts[name])
        }
      }
      return result
    }

    /* Contexts */

    /**
     * Get list contexts.
     * @returns {Array<Context>} List of contexts.
     */
    this.getContexts = (
    ) => [...contexts]

    /**
     * Add contexts at the index. *Can only be called when NOT enabled.*
     * @param {number} index Index to start adding at.
     * @param {...Context} _contexts List of contexts to add.
     * @returns {Array<Context>|undefined} List of added contexts.
     */
    this.addContexts = (
      index,
      ..._contexts
    ) => {
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
     * @param {...Context} _contexts List of contexts to remove.
     * @returns {Array<Context>|undefined} List of removed contexts.
     */
    this.removeContexts = (
      ..._contexts
    ) => {
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
     * @returns {Array<Directive>} List of directives.
     */
    this.getDirectives = (
    ) => [...directives]

    /**
     * Get list of directive names.
     * @returns {Array<string>} List of directive names.
     */
    this.getDirectivesNames = (
    ) => [...directivesNames]

    /**
     * Get object of directives with the directive name as key.
     * @returns {DirectiveMap} Object of directives.
     */
    this.getDirectivesObject = (
    ) => Object.assign({}, directivesObject)

    /**
     * Check whether a name matches that of a directive.
     * @param {string} attributeName Name of the attribute to match.
     * @returns {boolean} Whether the name matches that of a directive.
     */
    this.isDirectiveName = (
      attributeName,
    ) => directivesRegexp.test(attributeName)

    /**
     * Add directives at the index. *Can only be called when NOT enabled.*
     * @param {number} index Index to start adding at.
     * @param  {...Directive} _directives List of directives to add.
     * @returns {Array<Directive>|undefined} List of added directives.
     */
    this.addDirectives = (
      index,
      ..._directives
    ) => {
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
     * @param  {...Directive} _directives List of directives to remove.
     * @returns {Array<Directive>|undefined} List of removed directives.
     */
    this.removeDirectives = (
      ..._directives
    ) => {
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

    this.getProcessor = () => {
      return processExpression
    }

    /**
     * Update directives based on triggers. *Can only be called when enabled.*
     * @param {Array<Trigger>} _triggers List of triggers to update with.
     */
    this.update = (
      _triggers,
    ) => {
      if (!isEnabled) {
        // Exit early since it needs to enabled first.
        return
      }

      if (_triggers) {
        // Add new triggers to existing triggers.
        for (const trigger of _triggers) {
          // Deconstruct new trigger.
          const {
            id,
            path,
          } = trigger

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
      _triggers = Object.freeze(triggers)
      triggers = {}

      this.dispatchEvent('updating', [this, _triggers])

      // Update each component and collect any triggers.
      for (const component of components) {
        component.update(_triggers)
        // If this ever needs to be done in hierarchical order try the following. Go over each component and check if its parent is further down in the list. If so place the component directly after the parent. Then continue iteration over the components. This sorting only has to happen when a component is added to or moved in the hierarchy.
      }

      // Set as NOT updating.
      isUpdating = false

      // If there are triggers again then update again.
      if (Object.getOwnPropertySymbols(triggers).length > 0) {
        console.warn('Doars: during an update another update has been triggered. This should not happen unless an expression in one of the directives is causing a infinite loop by mutating the state.')
        // Use an animation frame to delay the update to prevent freezing and hope it resolves itself.
        window.requestAnimationFrame(() => this.update())
        return
      }

      // If there are any mutation to handle then handle them.
      if (mutations.length > 0) {
        handleMutation()
        return
      }

      this.dispatchEvent('updated', [this, _triggers])
    }

    /**
     * Handle document mutations by update internal data and executing directives.
     * @param {Array<MutationRecord>} newMutations List of mutations.
     */
    const handleMutation = (
      newMutations,
    ) => {
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

      const {
        stateDirectiveName,
        ignoreDirectiveName,
      } = this.getOptions()

      // Construct component name.
      const componentName = prefix + '-' + stateDirectiveName
      const ignoreName = prefix + '-' + ignoreDirectiveName

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
      const add = (
        element,
      ) => {
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
