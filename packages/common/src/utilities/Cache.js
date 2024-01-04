// Raises targets to:
//   chrome49
//   edge16
//   firefox39
//   ios11.2
//   safari11.1

// Import utilities.
import {
  parseResponse,
  responseType,
} from './Fetch.js'

const HEADER_DATE = 'Date'
const HEADER_CACHE_CONTROL = 'Cache-Control'

const CACHE_CLEAN_INTERVAL = 5 * 60 * 1e3 // Every 5 minutes.
const CACHE_INVALIDATION_CLAUSES = [
  'no-cache',
  'must-revalidate',
  'no-store',
]
const CACHE_NAME = 'doars'

let cacheCleanCounter = 0
let cacheCleanInterval = null
const cacheListeners = {}

export const validCacheFromHeaders = (
  headers,
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

/**
 *
 * @param {string} url Fetch URL.
 * @param {Request} options Fetch options.
 * @param {string} returnType Simplified type name the data should be converted to.
 * @returns {Promise<any>} Resulting data.
 */
export const getFromCache = (
  url,
  options,
  returnType,
) => new Promise((
  resolve,
  reject,
) => {
  if (!options.method || String.prototype.toUpperCase.call(options.method) === 'GET') {
    caches.open(CACHE_NAME)
      .then(cache => {
        cache.match(url)
          .then(cachedResponse => {
            if (cachedResponse) {
              if (validCacheFromHeaders(cachedResponse.headers)
              ) {
                // Automatically base return type on header.
                if (returnType === 'auto') {
                  returnType = responseType(cachedResponse, options)
                }
                // Parse response based on return type.
                if (returnType) {
                  cachedResponse = parseResponse(cachedResponse, returnType)
                }
                cachedResponse
                  .then((cachedResponseValue) => {
                    resolve({
                      headers: cachedResponse.headers,
                      value: cachedResponseValue,
                    })
                  })
                return
              }
              cache.delete(url)
            }

            // Check if the request is already being fetched. If so listen for the results on that.
            if (Object.prototype.hasOwnProperty.call(cacheListeners, url.location)) {
              cacheListeners[url.location].push({
                resolve,
                reject,
              })
              return
            } else {
              cacheListeners[url.location] = []
            }

            fetch(url, options)
              .then((response) => {
                if (
                  response.status < 200 ||
                  response.status >= 500
                ) {
                  const listeners = cacheListeners[url.location]
                  delete cacheListeners[url.location]

                  reject(response)

                  // Reject other listeners as well.
                  for (const listener of listeners) {
                    listener.reject(response)
                  }
                  return
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

                // Update cache.
                if (allowCache) {
                  cache.put(url, response.clone())
                } else {
                  cache.delete(url)
                }

                // Automatically base return type on header.
                if (returnType === 'auto') {
                  returnType = responseType(response, options)
                }
                // Parse response based on return type.
                if (returnType) {
                  response = parseResponse(response, returnType)
                }
                response
                  .then((responseValue) => {
                    // Add response to cache.
                    const result = {
                      headers: response.headers,
                      value: responseValue,
                    }

                    // Get other listeners.
                    const listeners = cacheListeners[url.location]
                    delete cacheListeners[url.location]

                    // Resolve promise.
                    resolve(result)

                    // Inform listeners of update.
                    if (listeners) {
                      for (const listener of listeners) {
                        listener.resolve(result)
                      }
                    }
                  })
                  .catch((error) => {
                    // Get other listeners.
                    const listeners = cacheListeners[url.location]
                    delete cacheListeners[url.location]

                    // Reject promise.
                    reject(error)

                    // Inform listeners of update.
                    if (listeners) {
                      for (const listener of listeners) {
                        listener.reject(error)
                      }
                    }
                  })
              })
              .catch((error) => {
                // Get other listeners.
                const listeners = cacheListeners[url.location]
                delete cacheListeners[url.location]

                // Reject promise.
                reject(error)

                // Inform listeners of update.
                if (listeners) {
                  for (const listener of listeners) {
                    listener.reject(error)
                  }
                }
              })
          })
          .catch(reject)
      })
      .catch(reject)
    return
  }

  fetch(url, options)
    .then((response) => {
      if (
        response.status < 200 ||
        response.status >= 500
      ) {
        const listeners = cacheListeners[url.location]
        delete cacheListeners[url.location]

        reject(response)

        // Reject other listeners as well.
        for (const listener of listeners) {
          listener.reject(response)
        }
        return
      }

      // Automatically base return type on header.
      if (returnType === 'auto') {
        returnType = responseType(response, options)
      }
      // Parse response based on return type.
      if (returnType) {
        response = parseResponse(response, returnType)
      }
      response
        .then((responseValue) => {
          // Add response to cache.
          const result = {
            headers: response.headers,
            value: responseValue,
          }

          // Get other listeners.
          const listeners = cacheListeners[url.location]
          delete cacheListeners[url.location]

          // Resolve promise.
          resolve(result)

          // Inform listeners of update.
          if (listeners) {
            for (const listener of listeners) {
              listener.resolve(result)
            }
          }
        })
        .catch((error) => {
          // Get other listeners.
          const listeners = cacheListeners[url.location]
          delete cacheListeners[url.location]

          // Reject promise.
          reject(error)

          // Inform listeners of update.
          if (listeners) {
            for (const listener of listeners) {
              listener.reject(error)
            }
          }
        })
    })
    .catch((error) => {
      // Get other listeners.
      const listeners = cacheListeners[url.location]
      delete cacheListeners[url.location]

      // Reject promise.
      reject(error)

      // Inform listeners of update.
      if (listeners) {
        for (const listener of listeners) {
          listener.reject(error)
        }
      }
    })
})

export const removeFromCache = (
  url,
) => caches.open(CACHE_NAME)
  .then(cache => {
    cache.delete(url)
  })
  .catch()

export const startCacheCleaner = (
) => {
  // Exit early if a cache clearer is already set.
  if (cacheCleanCounter > 0) {
    cacheCleanCounter++
    return
  }

  // Every x amount of seconds remove stale items from the cache, therefore reducing the memory footprint of the plugin.
  cacheCleanInterval = setInterval(() => {
    caches.open(CACHE_NAME)
      .then(cache => {
        cache.keys()
          .then(cacheKeys => {
            for (const cacheKey of cacheKeys) {
              cache.match(cacheKey)
                .then(cachedResponse => {
                  if (!validCacheFromHeaders(cachedResponse.headers)) {
                    cache.delete(cacheKey)
                  }
                })
            }
          })
      })
  }, CACHE_CLEAN_INTERVAL)
}

export const stopCacheCleaner = (
) => {
  cacheCleanCounter--
  if (
    cacheCleanCounter <= 0 &&
    cacheCleanInterval
  ) {
    clearInterval(cacheCleanInterval)
  }
}

export default {
  getFromCache,
  removeFromCache,
  startCacheCleaner,
  stopCacheCleaner,
  validCacheFromHeaders,
}
