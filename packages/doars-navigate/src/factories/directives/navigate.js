// Import constants.
import {
  PRELOAD_INTERACT,
  PRELOAD_INTERSECT,
} from '../../constants.js'
// Import symbols.
import { NAVIGATE } from '../../symbols.js'

// Import utilities.
import { insertAfter } from '@doars/common/src/utilities/Element.js'
import { decode } from '@doars/common/src/utilities/Html.js'
import { morphTree } from '@doars/common/src/utilities/Morph.js'

// Cannot be renamed...
const NAME_LOADER = '-loader'
const NAME_TARGET = '-target'
const HEADER_DATE = 'Date'
const HEADER_CACHE_CONTROL = 'Cache-Control'
const CACHE_INVALIDATION_CLAUSES = [
  'no-cache',
  'must-revalidate',
  'no-store',
]

const loaderAdd = (
  attribute,
  component,
  libraryOptions,
  processExpression,
  transitionIn,
) => {
  const element = attribute.getElement()
  const directive = attribute.getDirective()

  const attributeName = libraryOptions.prefix + '-' + directive + NAME_LOADER
  if (!element.hasAttribute(attributeName)) {
    return
  }
  let loaderTemplate = processExpression(
    component,
    attribute,
    element.getAttribute(attributeName),
  )
  if (!loaderTemplate) {
    return
  }

  if (typeof (loaderTemplate) === 'string') {
    loaderTemplate = element.querySelector(loaderTemplate)
  }

  // Check if placed on a template tag.
  if (loaderTemplate.tagName !== 'TEMPLATE') {
    console.warn('Doars: `' + attributeName + '` directive must be placed on a `<template>` tag.')
    return
  }
  if (loaderTemplate.childCount > 1) {
    console.warn('Doars: `' + attributeName + '` directive must have a single child node.')
    return
  }

  // Cancel current transition.
  if (attribute[NAVIGATE].loaderTransitionOut) {
    attribute[NAVIGATE].loaderTransitionOut()
    attribute[NAVIGATE].loaderTransitionOut = null
  } else if (attribute[NAVIGATE].loaderElement) {
    return
  }

  // Create new element from template.
  let loaderElement = document.importNode(loaderTemplate.content, true)
  // Add element after the template element.
  insertAfter(loaderTemplate, loaderElement)
  // Get HTMLElement reference instead of DocumentFragment.
  attribute[NAVIGATE].loaderElement = loaderElement = loaderTemplate.nextElementSibling

  // Transition element in.
  attribute[NAVIGATE].loaderTransitionIn = transitionIn(component, loaderElement)
}

const loaderRemove = (
  attribute,
  component,
  transitionOut,
) => {
  // Check if not already transitioning out and if a loader element exists.
  if (
    attribute[NAVIGATE].loaderTransitionOut ||
    !attribute[NAVIGATE].loaderElement
  ) {
    return
  }
  // Transition element in.
  const loaderElement = attribute[NAVIGATE].loaderElement
  attribute[NAVIGATE].loaderTransitionIn =
    transitionOut(component, loaderElement, () => {
      if (loaderElement) {
        loaderElement.remove()
      }
    })
}

const validCacheFromHeaders = (
  headers,
  maxAge = null,
) => {
  if (
    !headers.has(HEADER_DATE) ||
    !headers.has(HEADER_CACHE_CONTROL)
  ) {
    return false
  }
  const cacheDate = new Date(headers.get(HEADER_DATE))
  const currentDate = new Date()

  // Exit early if the cached date is in the future.
  if (cacheDate > currentDate) {
    return false
  }

  if (maxAge) {
    // Calculate expiration date.
    const expireDate = new Date(cacheDate.getTime() + maxAge)
    if (currentDate > expireDate) {
      return false
    }
  }

  // Get max age of the cached item.
  const cacheControl = (headers.get(HEADER_CACHE_CONTROL)).split(',')
  let cacheMaxAge = 0
  for (const cacheControlItem of cacheControl) {
    if (cacheControlItem.trim().startsWith('max-age=')) {
      cacheMaxAge = parseInt(cacheControlItem.split('=')[1].trim(), 10)
    }
    if (cacheControlItem.trim().startsWith('s-maxage=')) {
      cacheMaxAge = parseInt(cacheControlItem.split('=')[1].trim(), 10)
      break // Break since max-age should not overwrite this.
    }
  }
  // Exit early on invalid max ages.
  if (cacheMaxAge <= 0) {
    return false
  }

  // Calculate expiration date.
  const expireDate = new Date(cacheDate.getTime() + (cacheMaxAge * 1e3))
  return expireDate >= currentDate
}

let clearCacheCounter = 0
let clearCacheInterval = null

export default (
  options,
) => {
  let cache = {}
  const setupCacheClearing = (
  ) => {
    // Exit early if a cache clearer is already set.
    if (clearCacheCounter > 0) {
      clearCacheCounter++
      return
    }

    // Every x amount of seconds remove stale items from the cache, therefore reducing the memory footprint of the plugin.
    clearCacheInterval = setInterval(
      () => {
        for (const location in cache) {
          if (
            !Object.hasOwnProperty.call(cache, location) ||
            !cache.headers
          ) {
            continue
          }
          if (!validCacheFromHeaders(cache.headers, options.cacheMaxAge)) {
            delete cache[location]
          }
        }
      },
      options.cacheInterval,
    )
  }
  const getFromUrl = (
    url,
    dispatchEvent,
  ) => {
    return new Promise((resolve) => {
      // Check if same website.
      if (window.location.hostname !== url.hostname) {
        resolve(null)
      }

      // Try and get item from cache.
      if (Object.hasOwnProperty.call(cache, url.location)) {
        if (
          cache[url.location].headers &&
          validCacheFromHeaders(cache[url.location].headers)
        ) {
          resolve(cache[url.location])
          return
        }

        if (cache[url.location].listeners) {
          cache[url.location].listeners.push(
            () => {
              resolve(cache[url.location])
            },
          )
        } else {
          cache[url.location] = {
            listeners: [],
          }
        }
      } else {
        cache[url.location] = {
          listeners: [],
        }
      }

      // Dispatch navigation started event.
      dispatchEvent('-started', {
        url,
      })

      fetch(url, options.defaultInit).then((response) => {
        if (
          response.status < 200 ||
          response.status >= 300
        ) {
          // Dispatch navigation failed event.
          dispatchEvent('-failed', {
            response,
            url,
          })

          resolve(null)
          return
        }

        // Validate content type. Allow all but notify on invalid.
        const contentType = response.headers.get('Content-Type')
        if (!contentType.toLowerCase().startsWith('text/html')) {
          console.warn('Returned response not of header type text/html, content type is "' + contentType + '".')
        }

        // Check if the request can be cached.
        let allowCache = true
        if (response.headers.has(HEADER_CACHE_CONTROL)) {
          const cacheControl = response.headers.get(HEADER_CACHE_CONTROL).split(',')
          let maxAge = 0
          for (const cacheControlItem of cacheControl) {
            const cacheClause = cacheControlItem.trim()

            if (CACHE_INVALIDATION_CLAUSES.indexOf(cacheClause) >= 0) {
              allowCache = false
              break
            }

            if (cacheClause.startsWith('s-maxage=')) {
              maxAge = parseInt(cacheClause.split('=')[1].trim(), 10)
              if (maxAge <= 0) {
                allowCache = false
                break
              }
            }

            if (
              cacheClause.startsWith('max-age=') &&
              maxAge <= 0 // Prevent override of s-maxage.
            ) {
              maxAge = parseInt(cacheClause.split('=')[1].trim(), 10)
              if (maxAge <= 0) {
                allowCache = false
                break
              }
            }
          }
        }

        response.text().then((html) => {
          // Add response to cache.
          const result = {
            headers: response.headers,
            html,
          }

          // Get listeners before updating the cache,
          const listeners = cache[url.location].listeners

          // Update cache.
          if (allowCache) {
            cache[url.location] = result
            setupCacheClearing()
          } else {
            delete cache[url.location]
          }

          // Resolve promise.
          resolve(result)

          // Inform listeners of update.
          if (listeners) {
            for (const listener of listeners) {
              listener()
            }
          }
        })
      })
    })
  }

  return {
    name: 'navigate',

    update: (
      component,
      attribute, {
        processExpression,
        transitionIn,
        transitionOut,
      },
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

        loaderAdd(
          attribute,
          component,
          libraryOptions,
          processExpression,
          transitionIn,
        )

        getFromUrl(url, dispatchEvent).then((result) => {
          // Validate that this is still the active request.
          if (
            !attribute[NAVIGATE].identifier ||
            attribute[NAVIGATE].identifier !== identifier
          ) {
            return
          }

          // Check if request was successful.
          if (!result) {
            loaderRemove(
              attribute,
              component,
              transitionOut,
            )

            delete attribute[NAVIGATE].url
            delete attribute[NAVIGATE].identifier
            return
          }

          // Decode string.
          let html = result.html
          if (modifiers.decode) {
            html = decode(result.html)
          }

          let target = null
          if (modifiers.document) {
            target = document.documentElement
          } else {
            const attributeName = libraryOptions.prefix + '-' + directive + NAME_TARGET
            if (element.hasAttribute(attributeName)) {
              target = processExpression(
                component,
                attribute,
                element.getAttribute(attributeName),
              )
              if (typeof (target) === 'string') {
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
              morphTree(target, html)
            } else {
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
            }
          } else if (modifiers.outer) {
            target.outerHTML = html
          } else {
            target.innerHTML = html
          }

          // Get new document title.
          let documentTitle = ''
          if (options.headerTitle && result.headers.has(options.headerTitle)) {
            documentTitle = result.headers.get(options.headerTitle)
          }

          // Update history api.
          if (modifiers.document && modifiers.history) {
            history.pushState({}, documentTitle, url)
          }

          // If document title was not updated via the history update, then set it now.
          if (documentTitle && document.title !== documentTitle) {
            document.title = documentTitle
          }

          loaderRemove(
            attribute,
            component,
            transitionOut,
          )

          delete attribute[NAVIGATE].url
          delete attribute[NAVIGATE].identifier

          // Dispatch navigation loaded event.
          dispatchEvent('-loaded', {
            url,
          })
        })
      }

      const loadHandler = (
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
        loadHandler,
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
      if (modifiers.preload === PRELOAD_INTERACT) {
        const preloadHandler = (event) => {
          const anchor = event.target.closest('a')
          if (!anchor || !anchor.hasAttribute('href')) {
            return
          }
          const href = anchor.getAttribute('href')
          getFromUrl(new URL(href, window.location), dispatchEvent)
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
      } else if (modifiers.preload === PRELOAD_INTERSECT) {
        const intersectionObserver = new IntersectionObserver(
          (anchors) => {
            for (const anchor of anchors) {
              if (anchor.isIntersecting) {
                getFromUrl(
                  new URL(
                    anchor.target.getAttribute('href'),
                    window.location,
                  ),
                  dispatchEvent,
                )
              }
            }
          },
          {
            root: null,
            rootMargin: options.intersectionMargin,
            threshold: options.intersectionThreshold,
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
        cache,
        element,
        historyHandler,
        loadHandler,
        destroyPreloader,
      }
    },

    destroy: (
      component,
      attribute, {
        transitionOut,
      },
    ) => {
      // Exit early if no listeners can be found.
      if (!attribute[NAVIGATE]) {
        return
      }

      // Stop clear cache interval.
      if (clearCacheCounter > 0) {
        clearCacheCounter--
        if (clearCacheCounter === 0 && clearCacheInterval) {
          clearInterval(clearCacheInterval)
          cache = {}
        }
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

      loaderRemove(
        attribute,
        component,
        transitionOut,
      )

      // Delete directive data.
      delete attribute[NAVIGATE]
    },
  }
}
