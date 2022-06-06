import { createContexts } from './ContextUtils.js'
import { get } from '@doars/utils/src/ObjectUtils.js'

const PATH_VALIDATOR = /^[a-z$_]+[0-9a-z$_]*(?:\.[a-z$_]+[0-9a-z$_]*)*$/is

export const call = (
  component,
  attribute,
  expression,
  extra = null,
  options = null
) => {
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

  // Get result from
  expression = expression.trim()
  if (!PATH_VALIDATOR.test(expression)) {
    console.error('Error encountered when executing an expression. Expression is not a valid dot separated path: ', expression)
    result = null
  } else {
    result = get(contexts, expression)
    if (typeof (result) === 'function') {
      try {
        result = result(contexts)
      } catch (error) {
        console.error(error, 'Error encountered when calling function on context matching: ', expression)
      }
    }
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
  call: call,
}
