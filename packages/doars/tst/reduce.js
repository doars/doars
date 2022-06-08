import { parse } from '../src/utils/ParseUtils.js'
import { reduce } from '../src/utils/ReduceUtils.js'

const tests = {
  // Compound.
  // '1;': {},
  // '1; 2; 3': {},

  // Identifiers.
  // 'identifier': { identifier: 4 },
  // 'object["property"]': { object: { property: 'value' } },
  // 'array[1]': { array: [1, 2] },

  // Literals.
  // '12': {},
  // '"string"': {},

  // Objects and properties.
  // '{ hello: "world" }': {},
  // '{ "hello": "world" }': {},
  // '{ [hello]: "world" }': { hello: 'bye' },

  // Sequence.
  '("hello")': {},
  '(1 + 2)': {},
  '(a + 2 == 3)': { a: 1 },

  // Update. TODO:
  // '--counter': { counter: 0 },
  // 'counter--': { counter: 0 },
  // '++counter': { counter: 0 },
  // 'counter++': { counter: 0 },
  // '--something.counter': { something: { counter: 0 } },
  // 'something.counter--': { something: { counter: 0 } },
}
for (const code in tests) {
  const context = tests[code]
  const result = reduce(
    parse(code),
    context
  )
  console.log(result)
}
