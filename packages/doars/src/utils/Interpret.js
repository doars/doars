import { createAutoContexts } from './Context.js'
import {
  COMPOUND,
  parse,
  reduce,
} from '@doars/interpret'

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

  // Create contexts.
  const [contexts, destroyContexts] = createAutoContexts(component, attribute, update, extra)

  // Try to execute code.
  let result
  try {
    const expressionParsed = parse(expression)
    if (options.return && expressionParsed.type === COMPOUND) {
      throw new Error('Unable to return a compound expression of: "' + expression + '".')
    }
    result = reduce(expressionParsed, contexts)
  } catch (error) {
    console.error(error, 'Error encountered when executing the following expression: ', expression)
    result = null
  }

  // Cleanup contexts.
  destroyContexts()

  return result
}

export default {
  interpret: interpret,
}
