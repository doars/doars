import { createAutoContexts } from './ContextUtils.js'
import { getDeeply } from '@doars/utils/src/ObjectUtils.js'

const PATH_VALIDATOR = /^[a-z$_]+[0-9a-z$_]*(?:\.[a-z$_]+[0-9a-z$_]*)*$/is

export const call = (
  component,
  attribute,
  expression,
  extra = null,
  options = null
) => {
  // Create contexts.
  const [contexts, destroyContexts] = createAutoContexts(component, attribute, update, extra)

  // Get result from
  expression = expression.trim()
  if (!PATH_VALIDATOR.test(expression)) {
    console.error('Error encountered when executing an expression. Expression is not a valid dot separated path: ', expression)
    result = null
  } else {
    result = getDeeply(contexts, expression.split('.'))
    if (typeof (result) === 'function') {
      try {
        result = result(contexts)
      } catch (error) {
        console.error(error, 'Error encountered when calling function on context matching: ', expression)
      }
    }
  }

  // Cleanup contexts.
  destroyContexts()

  return result
}

export default {
  call: call,
}
