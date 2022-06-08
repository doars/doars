import { createContexts } from './ContextUtils.js'
import { parse } from './ParseUtils.js'
import { reduce } from './ReduceUtils.js'

export const interpret = (
  component,
  attribute,
  expression,
  extra = null,
  options = null
) => {
  // Override default with given options.
  options = Object.assign({
    return: true,
  }, options)

  // Collect update triggers.
  const triggers = []
  const update = (id, context) => {
    triggers.push({
      id: id,
      path: context,
    })
  }

  // Create function context.
  let { contexts, destroy } = createContexts(component, attribute, update, extra)

  // Try to execute code.
  let result
  try {
    // TODO: If options.return is true no compound node should be allowed. Instead throw an error.
    result = reduce(parse(expression), contexts)
  } catch (error) {
    console.error(error, 'Error encountered when executing the following expression: ', expression)
    result = null
  }

  // Invoke destroy.
  destroy()

  // Dispatch update triggers.
  if (triggers.length > 0) {
    component.getLibrary().update(triggers)
  }

  return result
}

export default {
  interpret: interpret,
}
