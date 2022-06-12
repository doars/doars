// Import testing framework.
import { assert } from 'chai'

// Import helpers.
import { deepAssign } from '@doars/common/src/utils/Object.js'

// Import code to test.
import { parse } from '../src/utils/Parse.js'
import { reduce } from '../src/utils/Reduce.js'

export default class InterpretTest {
  constructor(
    name,
    expression,

    reducedExpected,
    parsedExpected,

    context = {},
    contextExpected = {}
  ) {
    this.name = name
    this.expression = expression

    this.reducedExpected = reducedExpected
    this.parsedExpected = parsedExpected

    this.context = context
    this.contextExpected = contextExpected
  }

  run () {
    describe(this.name + ': ' + this.expression, () => {
      // Parse the expression.
      const nodes = parse(this.expression)
      // Verify parsed nodes.
      if (this.parsedExpected !== undefined) {
        it('Parsing', () => {
          assert.deepEqual(nodes, this.parsedExpected)
        })
      }

      // Clone context.
      const context = deepAssign({}, this.context)
      // Reduce the parsed expression.
      const result = reduce(nodes, context)
      // Verify reduced result.
      if (this.reducedExpected !== undefined) {
        it('Reducing', () => {
          assert.deepEqual(result, this.reducedExpected)
        })
      }
      // Verify context mutation.
      if (this.contextExpected !== undefined) {
        it('Context', () => {
          assert.deepEqual(context, this.contextExpected)
        })
      }
    })
  }
}
