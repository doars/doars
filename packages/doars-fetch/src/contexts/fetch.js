// Import utilities.
import {
  getFromCache,
} from '@doars/common/src/utilities/Cache.js'
import {
  parseResponse,
  responseType,
} from '@doars/common/src/utilities/Fetch.js'
import { deepAssign } from '@doars/common/src/utilities/Object.js'

export default ({
  fetchContextName,
  fetchOptions,
}) => ({
  name: fetchContextName,

  create: (
  ) => {
    return {
      value: (
        url,
        options = null,
      ) => {
        // Apply default options to init.
        if (fetchOptions) {
          options = deepAssign({}, fetchOptions, options)
        }

        // Extract optional return type.
        let returnType = options.returnType ? options.returnType : null
        delete options.returnType

        // Perform and process fetch request.
        if (
          !options.method ||
          String.prototype.toUpperCase.call(options.method) === 'GET'
        ) {
          return getFromCache(
            url,
            options,
            responseType,
          )
            .then((result) => {
              if (result && result.value) {
                return result.value
              }
            })
        } else {
          return fetch(
            url,
            options,
          )
            .then((
              response,
            ) => {
              // Automatically base return type on header.
              if (returnType === 'auto') {
                returnType = responseType(response, options)
              }
              // Parse response based on return type.
              if (returnType) {
                response = parseResponse(response, returnType)
              }
              return response
            })
        }
      },
    }
  },
})
