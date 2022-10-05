import {
  BINARY,
  IDENTIFIER,
  LITERAL,
} from '../../src/types.js'
import test from './utilities/test.js'

test('Binary', 'false || true', true, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '||',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'false || false', false, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '||',
  right: {
    type: LITERAL,
    value: false,
  },
  type: BINARY,
})

test('Binary', 'false && true', false, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '&&',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'true && true', true, {
  left: {
    type: LITERAL,
    value: true,
  },
  operator: '&&',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'null ?? true', true, {
  left: {
    type: LITERAL,
    value: null,
  },
  operator: '??',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'undefined ?? true', true, {
  left: {
    type: LITERAL,
    value: undefined,
  },
  operator: '??',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'false ?? true', false, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '??',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'true ?? false', true, {
  left: {
    type: LITERAL,
    value: true,
  },
  operator: '??',
  right: {
    type: LITERAL,
    value: false,
  },
  type: BINARY,
})

test('Binary', 'false == true', false, {
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
})

test('Binary', 'true == true', true, {
  left: {
    type: LITERAL,
    value: true,
  },
  operator: '==',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'false != true', true, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '!=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'true != true', false, {
  left: {
    type: LITERAL,
    value: true,
  },
  operator: '!=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'false === true', false, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '===',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'true === true', true, {
  left: {
    type: LITERAL,
    value: true,
  },
  operator: '===',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'false !== true', true, {
  left: {
    type: LITERAL,
    value: false,
  },
  operator: '!==',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', 'true !== true', false, {
  left: {
    type: LITERAL,
    value: true,
  },
  operator: '!==',
  right: {
    type: LITERAL,
    value: true,
  },
  type: BINARY,
})

test('Binary', '0 < 1', true, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '<',
  right: {
    type: LITERAL,
    value: 1,
  },
  type: BINARY,
})

test('Binary', '0 < 0', false, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '<',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '1 < 0', false, {
  left: {
    type: LITERAL,
    value: 1,
  },
  operator: '<',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '0 > 1', false, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '>',
  right: {
    type: LITERAL,
    value: 1,
  },
  type: BINARY,
})

test('Binary', '0 > 0', false, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '>',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '1 > 0', true, {
  left: {
    type: LITERAL,
    value: 1,
  },
  operator: '>',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '0 <= 1', true, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '<=',
  right: {
    type: LITERAL,
    value: 1,
  },
  type: BINARY,
})

test('Binary', '0 <= 0', true, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '<=',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '1 <= 0', false, {
  left: {
    type: LITERAL,
    value: 1,
  },
  operator: '<=',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '0 >= 1', false, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '>=',
  right: {
    type: LITERAL,
    value: 1,
  },
  type: BINARY,
})

test('Binary', '0 >= 0', true, {
  left: {
    type: LITERAL,
    value: 0,
  },
  operator: '>=',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '1 >= 0', true, {
  left: {
    type: LITERAL,
    value: 1,
  },
  operator: '>=',
  right: {
    type: LITERAL,
    value: 0,
  },
  type: BINARY,
})

test('Binary', '2 * 4', 8, {
  left: {
    type: LITERAL,
    value: 2,
  },
  operator: '*',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: BINARY,
})

test('Binary', '2 / 4', 0.5, {
  left: {
    type: LITERAL,
    value: 2,
  },
  operator: '/',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: BINARY,
})

test('Binary', '4 % 2', 0, {
  left: {
    type: LITERAL,
    value: 4,
  },
  operator: '%',
  right: {
    type: LITERAL,
    value: 2,
  },
  type: BINARY,
})

test('Binary', '4 % 3', 1, {
  left: {
    type: LITERAL,
    value: 4,
  },
  operator: '%',
  right: {
    type: LITERAL,
    value: 3,
  },
  type: BINARY,
})

test('Binary', '2 + 4', 6, {
  left: {
    type: LITERAL,
    value: 2,
  },
  operator: '+',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: BINARY,
})

test('Binary', '2 - 4', -2, {
  left: {
    type: LITERAL,
    value: 2,
  },
  operator: '-',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: BINARY,
})

test('Binary with identifier', '2 - hello', -2, {
  left: {
    type: LITERAL,
    value: 2,
  },
  operator: '-',
  right: {
    'name': 'hello',
    type: IDENTIFIER,
  },
  type: BINARY,
}, {
  hello: 4,
}, {
  hello: 4,
})
