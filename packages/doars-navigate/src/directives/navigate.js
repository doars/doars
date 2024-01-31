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
  select as selectFromElement,
} from '@doars/common/src/utilities/Element'
import { decode } from '@doars/common/src/utilities/Html.js'
import {
  hideIndicator,
  showIndicator,
} from '@doars/common/src/utilities/Indicator.js'
import { readdScripts } from '@doars/common/src/utilities/Script.js'
import { morphTree } from '@doars/common/src/utilities/Morph.js'

const NAVIGATE = Symbol('NAVIGATE')

/**
 * @typedef DirectiveOptions
 * @type {object}
 * @property {object} fetchOptions Object of options given to the fetch method when submitting data.
 * @property {string} intersectionMargin Margin of the intersection observer.
 * @property {number|Array<number>} intersectionThreshold Thresholds of the intersection observer.
 */

/**
 * @param {DirectiveOptions} options Options used for creating the directive.
 * @returns {Directive} Created submit directive.
 */
export default ({
  fetchOptions,
  intersectionMargin,
  intersectionThreshold,
  navigateDirectiveName,
}) => {
  return {
    name: navigateDirectiveName,

    update: (
      component,
      attribute,
      processExpression,
    ) => {
      const element = attribute.getElement()
      if (element[NAVIGATE]) {
        return
      }

      // Destruct component.
      const library = component.getLibrary()
      const libraryOptions = library.getOptions()

      // Deconstruct attribute.
      const directive = attribute.getDirective()
      const modifiers = attribute.getModifiers()

      // Process modifiers.

      // Set listener options.
      const listenerOptions = {}
      if (modifiers.capture) {
        listenerOptions.capture = true
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

      const loadFromUrl = (
        url,
      ) => {
        attribute[NAVIGATE].url = url
        const identifier = (new Date()).toISOString()
        attribute[NAVIGATE].identifier = identifier

        showIndicator(
          component,
          attribute,
          processExpression,
        )

        // Dispatch navigation started event.
        dispatchEvent('-started', {
          url,
        })

        fetchAndParse(
          url,
          Object.assign({}, fetchOptions, {
            headers: Object.assign({}, fetchOptions.headers, fetchHeaders),
          }),
        )
          .then(result => {
            // Validate that this is still the active request.
            if (
              !attribute[NAVIGATE].identifier ||
              attribute[NAVIGATE].identifier !== identifier
            ) {
              return
            }

            // Check if request was successful.
            if (!result) {
              hideIndicator(
                component,
                attribute,
              )

              delete attribute[NAVIGATE].url
              delete attribute[NAVIGATE].identifier
              return
            }

            // Decode string.
            let html = result.value
            if (modifiers.decode) {
              html = decode(result.value)
            }

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
            if (modifiers.morph) {
              if (modifiers.outer) {
                morphTree(
                  target,
                  selectFromElement(
                    elementFromString(html),
                    component,
                    attribute,
                    processExpression,
                  ),
                )
              } else {
                // Ensure element only has one child.
                if (target.children.length === 0) {
                  target.append(document.createElement('div'))
                } else if (target.children.length > 1) {
                  for (let i = target.children.length - 1; i >= 1; i--) {
                    target.children[i].remove()
                  }
                }

                // Morph first child to given target tree.
                const root = morphTree(
                  target.children[0],
                  selectFromElement(
                    elementFromString(html),
                    component,
                    attribute,
                    processExpression,
                  ),
                )
                if (!target.children[0].isSameNode(root)) {
                  target.children[0].remove()
                  target.append(root)
                }
              }
            } else if (modifiers.outer) {
              if (target.outerHTML !== html) {
                target.outerHTML = selectFromElement(
                  html,
                  component,
                  attribute,
                  processExpression,
                )
                if (libraryOptions.allowInlineScript || modifiers.script) {
                  readdScripts(target)
                }
              }
            } else if (target.innerHTML !== html) {
              target.innerHTML = selectFromElement(
                html,
                component,
                attribute,
                processExpression,
              )
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

            delete attribute[NAVIGATE].url
            delete attribute[NAVIGATE].identifier

            dispatchEvent('-succeeded', {
              url,
            })
          })
          .catch(() =>
            dispatchEvent('-failed', {
              url,
            }),
          )
      }

      const interactionHandler = (
        event,
      ) => {
        const anchor = event.target.closest('a')
        if (!anchor || !anchor.hasAttribute('href')) {
          return
        }
        const href = anchor.getAttribute('href')
        const url = new URL(href, window.location)

        // Check if same website.
        if (window.location.hostname !== url.hostname) {
          return
        }

        // Exit early if the link is being loaded.
        if (
          attribute[NAVIGATE].url &&
          attribute[NAVIGATE].url.href === url.href
        ) {
          return
        }

        // Prevent default.
        event.preventDefault()
        if (modifiers.stop) {
          event.stopPropagation()
        }

        loadFromUrl(url)
      }
      element.addEventListener(
        'click',
        interactionHandler,
        listenerOptions,
      )

      // Listen to history api if it can target the whole page.
      let historyHandler
      if (modifiers.document && modifiers.history) {
        historyHandler = (
          event,
        ) => {
          const url = new URL(event.target.location)

          // Exit early if the link is being loaded already.
          if (
            attribute[NAVIGATE].url &&
            attribute[NAVIGATE].url.href === url.href
          ) {
            return
          }

          loadFromUrl(url)
        }
        window.addEventListener(
          'popstate',
          historyHandler,
          { passive: true },
        )
      }

      let destroyPreloader
      if (modifiers.preload === 'interact') {
        const preloadHandler = (event) => {
          const anchor = event.target.closest('a')
          if (!anchor || !anchor.hasAttribute('href')) {
            return
          }
          const url = new URL(
            anchor.getAttribute('href'),
            window.location,
          )

          // Dispatch navigation started event.
          dispatchEvent('-started', {
            url,
          })

          fetchAndParse(
            url,
            Object.assign({}, fetchOptions, {
              headers: Object.assign({}, fetchOptions.headers, fetchHeaders),
            }),
          )
        }
        element.addEventListener(
          'focusin',
          preloadHandler,
          Object.assign({ passive: true }, listenerOptions),
        )
        element.addEventListener(
          'pointerenter',
          preloadHandler,
          Object.assign({ passive: true }, listenerOptions),
        )

        destroyPreloader = (
        ) => {
          element.removeEventListener(
            'focusin',
            attribute[NAVIGATE].preloadHandler,
          )
          element.removeEventListener(
            'pointerenter',
            attribute[NAVIGATE].preloadHandler,
          )
        }
      } else if (modifiers.preload === 'intersect') {
        const intersectionObserver = new IntersectionObserver(
          (anchors) => {
            for (const anchor of anchors) {
              if (anchor.isIntersecting) {
                const url = new URL(
                  anchor.target.getAttribute('href'),
                  window.location,
                )

                // Dispatch navigation started event.
                dispatchEvent('-started', {
                  url,
                })

                fetchAndParse(
                  url,
                  Object.assign({}, fetchOptions, {
                    headers: Object.assign({}, fetchOptions.headers, fetchHeaders),
                  }),
                )
              }
            }
          },
          {
            root: null,
            rootMargin: intersectionMargin,
            threshold: intersectionThreshold,
          },
        )
        const mutationObserver = new MutationObserver(
          (mutations) => {
            for (const mutation of mutations) {
              if (mutation.type === 'attributes') {
                if (
                  mutation.attributeName === 'href' &&
                  mutation.target instanceof HTMLElement &&
                  mutation.target.tagName === 'A'
                ) {
                  // Start or stop observing the element if the href was added or removed.
                  if (mutation.target.hasAttribute('href')) {
                    intersectionObserver.observe(mutation.target)
                  } else {
                    intersectionObserver.unobserve(mutation.target)
                  }
                }
              } else if (mutation.type === 'childList') {
                for (const node of mutation.addedNodes) {
                  if (
                    node instanceof HTMLElement &&
                    node.tagName === 'A' &&
                    node.hasAttribute('href')
                  ) {
                    // Start observing the node.
                    intersectionObserver.observe(node)
                  }
                }

                // Stop observing removed nodes.
                for (const node of mutation.removedNodes) {
                  if (
                    node instanceof HTMLElement &&
                    node.tagName === 'A' &&
                    node.hasAttribute('href')
                  ) {
                    intersectionObserver.unobserve(node)
                  }
                }
              }
            }
          },
        )

        destroyPreloader = (
        ) => {
          mutationObserver.disconnect()
          intersectionObserver.disconnect()
        }

        // Start observing existing anchor tags.
        const anchors = element.querySelectorAll('a[href]')
        for (const anchor of anchors) {
          intersectionObserver.observe(anchor)
        }

        mutationObserver.observe(
          element,
          {
            attributes: true,
            childList: true,
            subtree: true,
          },
        )
      }

      attribute[NAVIGATE] = {
        element,
        historyHandler,
        loadHandler: interactionHandler,
        destroyPreloader,
      }
    },

    destroy: (
      component,
      attribute,
    ) => {
      // Exit early if no listeners can be found.
      if (!attribute[NAVIGATE]) {
        return
      }

      // Remove existing listener.
      attribute[NAVIGATE].element.removeEventListener(
        'click',
        attribute[NAVIGATE].loadHandler,
      )
      if (attribute[NAVIGATE].historyHandler) {
        window.removeEventListener(
          'popstate',
          attribute[NAVIGATE].historyHandler,
        )
      }
      if (attribute[NAVIGATE].destroyPreloader) {
        attribute[NAVIGATE].destroyPreloader()
      }

      hideIndicator(
        component,
        attribute,
      )

      // Delete directive data.
      delete attribute[NAVIGATE]
    },
  }
}
