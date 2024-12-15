// Import utilities.
import { fetchAndParse } from '@doars/common/src/utilities/Fetch.js'
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
        const returnType = options.returnType ? options.returnType : null
        delete options.returnType

        // Perform and process fetch request.
        return fetchAndParse(
          url,
          options,
          returnType,
        )
          .then((result) => {
            if (
              result
              && result.value
            ) {
              return result.value
            }
          })
      },
    }
  },
})
