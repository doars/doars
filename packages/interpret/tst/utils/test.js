// Import testing framework.
import { assert } from 'chai'

// Import code to test.
import parse from '../../src/parse.js'
import run from '../../src/run.js'

export default (
  name,
  expression,

  resultExpected,
  nodesExpected,

  context = {},
  contextExpected = {}
) => {
  describe(name + ': ' + expression, () => {
    // Parse the expression.
    const nodes = parse(expression)
    // Verify parsed nodes.
    if (nodesExpected !== undefined) {
      it('Parsing', () => {
        assert.deepEqual(nodes, nodesExpected)
      })
    }

    // run the parsed expression.
    const result = run(nodes, context)
    // Verify rund result.
    if (resultExpected !== undefined) {
      it('Reducing', () => {
        assert.deepEqual(result, resultExpected)
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
