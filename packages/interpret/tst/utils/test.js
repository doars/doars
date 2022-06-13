// Import testing framework.
import { assert } from 'chai'

// Import code to test.
import parse from '../../src/parse.js'
import reduce from '../../src/reduce.js'

export default (
  name,
  expression,

  reducedExpected,
  parsedExpected,

  context = {},
  contextExpected = {}
) => {
  describe(name + ': ' + expression, () => {
    // Parse the expression.
    const nodes = parse(expression)
    // Verify parsed nodes.
    if (parsedExpected !== undefined) {
      it('Parsing', () => {
        assert.deepEqual(nodes, parsedExpected)
      })
    }

    // Reduce the parsed expression.
    const result = reduce(nodes, context)
    // Verify reduced result.
    if (reducedExpected !== undefined) {
      it('Reducing', () => {
        assert.deepEqual(result, reducedExpected)
      })
    }
    // Verify context mutation.
    if (contextExpected !== undefined) {
      it('Context', () => {
        assert.deepEqual(context, contextExpected)
      })
    }
  })
}
