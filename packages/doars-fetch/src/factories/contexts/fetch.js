// Import utils.
import { deepAssign } from '@doars/common/src/utils/Object.js'
import { parseResponse, responseType } from '../../utils/FetchUtils.js'

export default ({ defaultInit }) => {
  return {
    name: '$fetch',

    create: () => {
      return {
        value: (url, init = null) => {
          // Apply default options to init.
          if (defaultInit) {
            init = deepAssign({}, defaultInit, init)
          }

          // Extract optional return type.
          let returnType = init.returnType ? init.returnType : null
          delete init.returnType

          // Perform and process fetch request.
          return fetch(url, init)
            .then((response) => {
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
  }
}
