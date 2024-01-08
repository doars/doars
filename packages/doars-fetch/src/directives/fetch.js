/**
 * @typedef {import('@doars/doars').default} Doars
 * @typedef {import('@doars/doars/src/Attribute.js').default} Attribute
 * @typedef {import('@doars/doars/src/Component.js').default} Component
 * @typedef {import('@doars/doars/src/Directive.js').Directive} Directive
 * @typedef {import('@doars/doars/src/Directive.js').DirectiveUtilities} DirectiveUtilities
 */

// Import utilities.
import { fetchAndParse } from '@doars/common/src/utilities/Fetch.js'
import {
  fromString as elementFromString,
  insertAfter,
  insertBefore,
} from '@doars/common/src/utilities/Element'
import { decode } from '@doars/common/src/utilities/Html.js'
import {
  hideIndicator,
  showIndicator,
} from '@doars/common/src/utilities/Indicator.js'
import { morphTree } from '@doars/common/src/utilities/Morph.js'
import { isPromise } from '@doars/common/src/utilities/Promise'
import { readdScripts } from '@doars/common/src/utilities/Script'

import { serializeFormData } from '../utilities/Xml'

const FETCH = Symbol('FETCH')

const EXECUTION_MODIFIERS = {
  NONE: 0,
  BUFFER: 1,
  DEBOUNCE: 2,
  THROTTLE: 5,
}

/**
 * @typedef DirectiveOptions
 * @type {object}
 * @property {object} fetchOptions Object of options given to the fetch method when submitting data.
 * @property {string} headerTitle Name of the header that can contain a new document title.
 */

/**
 * @param {DirectiveOptions} options Options used for creating the directive.
 * @returns {Directive} Created fetch directive.
 */
export default ({
  fetchOptions,
  fetchDirectiveEvaluate,
  fetchDirectiveName,
}) => ({
  name: fetchDirectiveName,

  update: (
    component,
    attribute,
    processExpression,
  ) => {
    // Destruct component.
    const library = component.getLibrary()
    const libraryOptions = library.getOptions()

    // Deconstruct attribute.
    const element = attribute.getElement()
    const directive = attribute.getDirective()
    const modifiers = attribute.getModifiers()
    const value = attribute.getValue()

    // Handle forms differently since the form values need to be used.
    const isForm = element.tagName === 'FORM'
    const isButton = element.tagName === 'BUTTON'

    // Check if existing listener exists.
    if (attribute[FETCH]) {
      // Exit early if value has not changed.
      if (attribute[FETCH].value === value) {
        return
      }

      // Remove existing listener so we don't listen twice.
      attribute[FETCH].target.removeEventListener(
        attribute[FETCH].eventName,
        attribute[FETCH].handler,
      )

      // Clear any ongoing timeouts.
      if (attribute[FETCH].timeout) {
        clearTimeout(attribute[FETCH].timeout)
      }

      // Delete directive data.
      delete attribute[FETCH]
    }

    // Process modifiers.

    let eventName = isForm ? 'submit' : 'click'
    if (modifiers.on) {
      eventName = modifiers.on
    }
    const encoding = (modifiers.encoding ? modifiers.encoding.toLowerCase() : 'urlencoded')
    const method = (modifiers.method ? modifiers.method.toUpperCase() : 'GET')
    const position = (modifiers.position ? modifiers.position.toLowerCase() : null)

    // Set listener options.
    const listenerOptions = {}
    if (modifiers.capture) {
      listenerOptions.capture = true
    }
    if (modifiers.once) {
      listenerOptions.once = true
    }
    if (modifiers.passive && !modifiers.prevent) {
      listenerOptions.passive = true
    }

    // Process execution modifiers.
    let executionModifier = EXECUTION_MODIFIERS.NONE
    if (modifiers.buffer) {
      executionModifier = EXECUTION_MODIFIERS.BUFFER
      if (modifiers.buffer === true) {
        modifiers.buffer = 5
      }
    } else if (modifiers.debounce) {
      executionModifier = EXECUTION_MODIFIERS.DEBOUNCE
      if (modifiers.debounce === true) {
        modifiers.debounce = 500
      }
    } else if (modifiers.throttle) {
      executionModifier = EXECUTION_MODIFIERS.THROTTLE
      if (modifiers.throttle === true) {
        modifiers.throttle = 500
      }
    }

    const fetchHeaders = {
      [libraryOptions.prefix + '-' + libraryOptions.requestHeaderName]: directive,
      Vary: libraryOptions.prefix + '-' + libraryOptions.requestHeaderName,
    }

    const dispatchEvent = (
      suffix = '',
      data = {},
    ) => {
      element.dispatchEvent(
        new CustomEvent(
          libraryOptions.prefix + '-' + directive + suffix,
          {
            detail: Object.assign({
              attribute,
              component,
            }, data),
          },
        ),
      )
    }

    /**
     * Perform a request.
     * @param {URL} url URL of the request to perform.
     * @returns {void}
     */
    const requestHandler = (
      url,
    ) => {
      /** @type {Request} */
      const _fetchOptions = {
        headers: {},
      }

      if (method) {
        _fetchOptions.method = method
      } else if (isForm && element.hasAttribute('method')) {
        _fetchOptions.method = element.getAttribute('method').toUpperCase()
      }

      if (isForm) {
        const formData = new FormData(element)
        let _encoding = encoding
        if (
          !_encoding &&
          element.hasAttribute('enctype')
        ) {
          _encoding = element.getAttribute('enctype').toLowerCase()
        }
        if (
          _fetchOptions.method === 'HEAD' ||
          _fetchOptions.method === 'GET'
        ) {
          _encoding = 'parameters'
        }

        switch (_encoding) {
          case 'json':
            _fetchOptions.headers['Content-Type'] = 'application/json; charset=UTF-8'
            _fetchOptions.body = JSON.stringify(Object.fromEntries(formData))
            break

          case 'multipart':
          case 'multipart/form-data':
            _fetchOptions.headers['Content-Type'] = 'multipart/form-data'
            _fetchOptions.body = formData
            break

          case 'parameters':
            const parameters = new URLSearchParams(formData).toString()
            for (const [parameterName, parameterValue] of parameters) {
              url.searchParams.set(parameterName, parameterValue)
            }
            break

          case 'urlencoded':
          case 'application/x-www-form-urlencoded':
            _fetchOptions.headers['Content-Type'] = 'application/x-www-form-urlencoded; charset=UTF-8'
            _fetchOptions.body = new URLSearchParams(formData).toString()
            break

          case 'xml':
            _fetchOptions.headers['Content-Type'] = 'application/xml; charset=UTF-8'
            _fetchOptions.body = serializeFormData(formData)
            break

          default:
            console.warn('DoarsFetch: "' + directive + '" directive\'s invalid encoding type "' + _encoding + '".')
            break
        }
      }

      dispatchEvent('-started', {
        url,
      })

      fetchAndParse(
        url,
        Object.assign({}, fetchOptions, _fetchOptions, {
          headers: Object.assign({}, _fetchOptions.headers, fetchHeaders),
        }),
      )
        .then((result) => {
          isLoading = false

          // Decode string.
          let html = result.value
          if (modifiers.decode) {
            html = decode(result.value)
          }

          /** @type {HTMLElement | null} */
          let target = null
          if (modifiers.document) {
            target = document.documentElement
          } else {
            const attributeName = libraryOptions.prefix + '-' + directive + '-' + libraryOptions.targetDirectiveName
            if (element.getAttribute(attributeName)) {
              if (libraryOptions.targetDirectiveEvaluate) {
                target = processExpression(
                  component,
                  attribute,
                  element.getAttribute(attributeName),
                )
              } else {
                target = element.getAttribute(attributeName)
              }
              if (target && typeof (target) === 'string') {
                target = element.querySelector(target)
              }
            }
            if (!target) {
              target = element
            }
          }

          // Update target.
          if (position === 'append') {
            const child = elementFromString(html)
            target.appendChild(child)
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child)
            }
          } else if (position === 'prepend') {
            const child = elementFromString(html)
            target.prepend(child)
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child)
            }
          } else if (position === 'after') {
            const child = elementFromString(html)
            insertAfter(target, child)
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child)
            }
          } else if (position === 'before') {
            const child = elementFromString(html)
            insertBefore(target, child)
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(child)
            }
          } else if (position === 'outer') {
            if (modifiers.morph) {
              morphTree(target, html)
            } else if (target.outerHTML !== html) {
              target.outerHTML = html
              if (libraryOptions.allowInlineScript || modifiers.script) {
                readdScripts(target)
              }
            }
          } else if (modifiers.morph) {
            // Ensure element only has one child.
            if (target.children.length === 0) {
              target.appendChild(document.createElement('div'))
            } else if (target.children.length > 1) {
              for (let i = target.children.length - 1; i >= 1; i--) {
                target.children[i].remove()
              }
            }

            // Morph first child to given target tree.
            const root = morphTree(target.children[0], html)
            if (!target.children[0].isSameNode(root)) {
              target.children[0].remove()
              target.appendChild(root)
            }
          } else if (target.innerHTML !== html) {
            target.innerHTML = html
            if (libraryOptions.allowInlineScript || modifiers.script) {
              readdScripts(...target.children)
            }
          }

          // Get new document link.
          if (libraryOptions.redirectHeaderName && result.headers.has(libraryOptions.prefix + '-' + libraryOptions.titleHeaderName)) {
            window.location.href = result.headers.get(libraryOptions.prefix + '-' + libraryOptions.titleHeaderName)
            return
          }

          // Get new document title.
          let documentTitle = ''
          if (libraryOptions.titleHeaderName && result.headers.has(libraryOptions.prefix + '-' + libraryOptions.titleHeaderName)) {
            documentTitle = result.headers.get(libraryOptions.prefix + '-' + libraryOptions.titleHeaderName)
          }

          // Update history api.
          if (modifiers.document && modifiers.history) {
            history.pushState({}, documentTitle, url)
          }

          // If document title was not updated via the history update, then set it now.
          if (documentTitle && document.title !== documentTitle) {
            document.title = documentTitle
          }

          hideIndicator(
            component,
            attribute,
          )

          dispatchEvent('-succeeded', {
            url,
          })
        })
        .catch(() => {
          hideIndicator(
            component,
            attribute,
          )

          dispatchEvent('-failed', {
            url,
          })
        })
    }

    let isLoading = false
    /**
     * Handles the interaction with a element containing the directive.
     * @param {Event} event Document event to handle.
     * @returns {void}
     */
    const handler = (
      event,
    ) => {
      // Only fire when self is provided if the target is the element itself.
      if (modifiers.self && event.target !== element) {
        return
      }

      if (isForm && !element.reportValidity()) {
        dispatchEvent('-invalid')
        return
      }

      // Prevent the default event action.
      if (
        (isForm && eventName === 'submit') ||
        (isButton && element.getAttribute('type', 'button') && eventName === 'click') ||
        modifiers.prevent
      ) {
        event.preventDefault()
      }
      // Stop propagation if the stop modifier is present.
      if (modifiers.stop) {
        event.stopPropagation()
      }

      const execute = (
      ) => {
        let url = null
        if (value && fetchDirectiveEvaluate) {
          url = processExpression(
            component,
            attribute,
            value,
            {
              $event: event,
              $events: attribute[FETCH].buffer,
            },
          )
        } else if (isForm && element.hasAttribute('action')) {
          url = element.getAttribute('action')
        }

        // Reset the buffer.
        attribute[FETCH].buffer = []

        if (!url) {
          return
        }
        isLoading = true

        showIndicator(
          component,
          attribute,
          processExpression,
        )

        if (isPromise(url)) {
          url.then((url) => requestHandler(url))
        } else {
          requestHandler(url)
        }
      }

      if (isLoading) {
        return
      }

      // Store event in buffer.
      attribute[FETCH].buffer.push(event)

      // Check if we need to apply an execution modifier.
      switch (executionModifier) {
        case EXECUTION_MODIFIERS.BUFFER:
          // Exit early if buffer is not full.
          if (attribute[FETCH].buffer.length < modifiers.buffer) {
            return
          }

          execute()
          return

        case EXECUTION_MODIFIERS.DEBOUNCE:
          // Clear existing timeout.
          if (attribute[FETCH].timeout) {
            clearTimeout(attribute[FETCH].timeout)
            attribute[FETCH].timeout = null
          }

          // Setup timeout and execute expression when it finishes.
          attribute[FETCH].timeout = setTimeout(execute, modifiers.debounce)
          return

        case EXECUTION_MODIFIERS.THROTTLE:
          // Get current time in milliseconds.
          const nowThrottle = window.performance.now()

          // Exit early if throttle time has not passed.
          if (attribute[FETCH].lastExecution && nowThrottle - attribute[FETCH].lastExecution < modifiers.throttle) {
            return
          }

          execute()

          // Store new latest execution time.
          attribute[FETCH].lastExecution = nowThrottle
          return
      }

      // Otherwise execute expression immediately.
      execute()
    }

    element.addEventListener(
      eventName,
      handler,
      listenerOptions,
    )

    attribute[FETCH] = {
      buffer: [],
      eventName,
      handler,
      target: element,
      timeout: attribute[FETCH] ? attribute[FETCH].timeout : undefined,
      value,
    }
  },

  destroy: (
    component,
    attribute,
  ) => {
    // Exit early if no listeners can be found.
    if (!attribute[FETCH]) {
      return
    }

    // Remove existing listener.
    attribute[FETCH].target.removeEventListener(
      attribute[FETCH].eventName,
      attribute[FETCH].handler,
    )
    // Clear any ongoing timeouts.
    if (attribute[FETCH].timeout) {
      clearTimeout(attribute[FETCH].timeout)
    }

    hideIndicator(
      component,
      attribute,
    )

    // Delete directive data.
    delete attribute[FETCH]
  },
})
