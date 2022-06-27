import { createAutoContexts } from './Context.js'
import { parse, run } from '@doars/interpret'

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
  const [contexts, destroyContexts] = createAutoContexts(component, attribute, extra)

  // Get result from the expression.
  let result
  try {
    const expressionParsed = parse(expression)
    if (options.return && expressionParsed && expressionParsed.length > 1) {
      throw new Error('Unable to return a single value from a compound expression of: "' + expression + '".')
    }
    result = run(expressionParsed, contexts)
  } catch (error) {
    console.error(error, 'Error encountered when executing the following expression: ', expression)
    result = null
  }

  // Cleanup contexts.
  destroyContexts()

  // Unwrap results.
  if (options.return && result) {
    result = result[0]
    return result
  }
}

export default {
  interpret: interpret,
}
