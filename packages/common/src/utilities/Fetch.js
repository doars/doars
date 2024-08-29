/**
 * Convert response to a desired type.
 * @param {Response} response The response to parse.
 * @param {string} type Simplified type name the data should be converted to.
 * @returns {Promise<any>} Resulting data.
 */
export const parseResponse = (
  response,
  type,
) => {
  let promise
  switch (String.prototype.toLowerCase.call(type)) {
    default:
      console.warn('Unknown response type "' + type + '" used when using the $fetch context.')
      break

    case 'arraybuffer':
      promise = response.arrayBuffer()
      break

    case 'blob':
      promise = response.blob()
      break

    case 'formdata':
      promise = response.formData()
      break

    case 'json':
      promise = response.json()
      break

    // HTML and xml need to be converted to text before being able to be parsed.
    case 'element':
    case 'html':
    case 'svg':
    case 'text':
    case 'xml':
      promise = response.text()
      break
  }

  if (!promise) {
    return null
  }

  return promise
    .then((
      response,
    ) => {
      switch (type) {
        // Convert from html to HTMLElement inside a document fragment.
        case 'element':
          const template = document.createElement('template')
          template.innerHTML = response
          response = template.content.childNodes[0]
          break

        // Parse some values via the DOM parser.
        case 'html':
          response = (new DOMParser()).parseFromString(response, 'text/html')
          break
        case 'svg':
          response = (new DOMParser()).parseFromString(response, 'image/svg+xml')
          break
        case 'xml':
          response = (new DOMParser()).parseFromString(response, 'application/xml')
          break
      }

      return response
    })
}

/**
 * Try and get the mime type of the response.
 * @param {Response} response Response to try and get the type from.
 * @param {Request} request Request the response originates from.
 * @returns {string} mime type.
 */
export const responseType = (
  response,
  request = null,
) => {
  // Check content type header.
  let contentType = response.headers.get('Content-Type')
  if (contentType) {
    contentType = String.prototype.toLowerCase.call(contentType).split(';')[0]
    const result = simplifyType(contentType.trim())
    if (result) {
      return result
    }
  }

  // Check url extension.
  let extension = response.url.split('.')
  if (extension) {
    extension = extension[extension.length - 1]
    switch (extension) {
      case 'htm':
      case 'html':
        return 'html'

      case 'json':
        return 'json'

      case 'svg':
        return 'svg'

      case 'txt':
        return 'text'

      case 'xml':
        return 'xml'
    }
  }

  // Check accept type header.
  if (request) {
    let acceptTypes = request.headers.Accept
    if (acceptTypes) {
      acceptTypes = String.prototype.toLowerCase.call(acceptTypes).split(',')
      for (let acceptType of acceptTypes) {
        acceptType = acceptType.split(';')[0].trim()
        const result = simplifyType(acceptType)
        if (result) {
          return result
        }
      }
    }
  }

  return null
}

/**
 * Simplify the mime type to single word.
 * @param {string} mimeType Mime type to simplify.
 * @returns {string} Simplified type.
 */
export const simplifyType = (
  mimeType,
) => {
  switch (mimeType) {
    case 'text/html':
      return 'html'

    case 'text/json':
    case 'application/json':
    case 'application/ld+json':
    case 'application/vnd.api+json':
      return 'json'

    case 'image/svg+xml':
      return 'svg'

    case 'text/plain':
      return 'text'

    case 'application/xml':
    case 'text/xml':
      return 'xml'
  }
}

const cacheListeners = {}

/**
 *
 * @param {string} url Fetch URL.
 * @param {Request} options Fetch options.
 * @param {string} returnType Simplified type name the data should be converted to.
 * @returns {Promise<any>} Resulting data.
 */
export const fetchAndParse = (
  url,
  options,
  returnType = 'auto',
) => new Promise((
  resolve,
  reject,
) => {
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
      const headers = response.headers

      // Automatically base return type on header.
      if (returnType === 'auto') {
        returnType = responseType(response, options)
      }
      // Parse response based on return type.
      if (returnType) {
        response = parseResponse(response, returnType)
      }
      response
        .then((value) => {
          // Get other listeners.
          const listeners = cacheListeners[url.location]
          delete cacheListeners[url.location]

          // Resolve promise.
          const result = {
            headers,
            value,
          }
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

export default {
  fetchAndParse,
  parseResponse,
  responseType,
  simplifyType,
}
