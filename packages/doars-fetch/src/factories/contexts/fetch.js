// Import utilities.
import { deepAssign } from '@doars/common/src/utilities/Object.js'
import { parseResponse, responseType } from '../../utilities/Fetch.js'

export default ({
  fetchOptions,
}) => ({
  name: '$fetch',

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
        return fetch(
          url,
          options,
        )
          .then((
            response,
          ) => {
            // Automatically base return type on header.
            if (returnType === 'auto' && response.headers.get('content-type')) {
              returnType = responseType(response)
            }

            // Parse response based on return type.
            if (returnType) {
              response = parseResponse(response, returnType)
            }

            return response
          })
      },
    }
  },
})
