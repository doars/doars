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

  // Parenthesis.
  // '("Pass")': {},
  // '(1 + 2)': {},

  // Ternary.
  // '1 === 2 ? "fail" : "pass"': {},

  // Binary.
  // 'null || 2': {}, // 2
  // '1 != 2': {}, // true
  // '1 === 2': {}, // false
  // '1 > 2': {}, // false
  // '1 % 2': {}, // 1
  // '1 - 2': {}, // 1
  // 'a + b': { a: 1, b: 2 }, // 3

  // Unary.
  // '-1': {},
  // '+a': { a: 3 },
  // '!true': {},
  // '!false': {},
  // '!!false': {},

  // Sequences.

  // Assignment.
  // 'hello = 2': { hello: 1 }, // 2
  // 'hello.world = 2': { hello: { world: 1 } }, // 2 TODO:
  // 'hello[there] = 2': { hello: { world: 1 }, there: 'world' }, // 2 TODO:
  // 'hello *= 2': { hello: 2 }, // 4
  // 'hello **= 2': { hello: 2 }, // 4
  // 'hello /= 2': { hello: 1 }, // 0.5
  // 'hello %= 2': { hello: 1 }, // 1
  // 'hello += 2': { hello: 1 }, // 3
  // 'hello -= 2': { hello: 1 }, // -1

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
