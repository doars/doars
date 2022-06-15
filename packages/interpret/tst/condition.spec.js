import {
  BINARY,
  CONDITION,
  IDENTIFIER,
  LITERAL,
} from '../src/types.js'
import test from './utils/test.js'

test('Ternary', 'false == false ? 1 : 2', 1, {
  condition: {
    left: {
      type: LITERAL,
      value: false,
    },
    operator: '==',
    right: {
      type: LITERAL,
      value: false,
    },
    type: BINARY,
  },
  consequent: {
    type: LITERAL,
    value: 1,
  },
  alternate: {
    type: LITERAL,
    value: 2,
  },
  type: CONDITION,
})

test('Ternary', 'false == true ? 1 : 2', 2, {
  condition: {
    left: {
      type: LITERAL,
      value: false,
    },
    operator: '==',
    right: {
      type: LITERAL,
      value: true,
    },
    type: BINARY,
  },
  consequent: {
    type: LITERAL,
    value: 1,
  },
  alternate: {
    type: LITERAL,
    value: 2,
  },
  type: CONDITION,
})

test('Ternary with identifier in conditional', 'false == hello ? 1 : 2', 2, {
  condition: {
    left: {
      type: LITERAL,
      value: false,
    },
    operator: '==',
    right: {
      name: 'hello',
      type: IDENTIFIER,
    },
    type: BINARY,
  },
  consequent: {
    type: LITERAL,
    value: 1,
  },
  alternate: {
    type: LITERAL,
    value: 2,
  },
  type: CONDITION,
}, {
  hello: true
}, {
  hello: true
})

test('Ternary with identifier in alternate', 'false == true ? 1 : hello', 2, {
  condition: {
    left: {
      type: LITERAL,
      value: false,
    },
    operator: '==',
    right: {
      type: LITERAL,
      value: true,
    },
    type: BINARY,
  },
  consequent: {
    type: LITERAL,
    value: 1,
  },
  alternate: {
    name: 'hello',
    type: IDENTIFIER,
  },
  type: CONDITION,
}, {
  hello: 2
}, {
  hello: 2
})
