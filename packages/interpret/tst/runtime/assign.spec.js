import {
  ASSIGN,
  IDENTIFIER,
  LITERAL
} from '../../src/types.js'
import test from './utilities/test.js'

test('Assign', 'hello = "world"', 'world', {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '=',
  right: {
    type: LITERAL,
    value: 'world',
  },
  type: ASSIGN,
}, {}, {
  hello: 'world',
})

test('Assign', 'hello = "world"', 'world', {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '=',
  right: {
    type: LITERAL,
    value: 'world',
  },
  type: ASSIGN,
}, {
  hello: null,
}, {
  hello: 'world',
})

test('Assign', 'hello = 3', 3, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '=',
  right: {
    type: LITERAL,
    value: 3,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: 3,
})

// Logical assignments.

test('Assign', 'hello ||= true', true, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '||=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: ASSIGN,
}, {
  hello: false,
}, {
  hello: true,
})

test('Assign', 'hello ||= false', true, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '||=',
  right: {
    type: LITERAL,
    value: false,
  },
  type: ASSIGN,
}, {
  hello: true,
}, {
  hello: true,
})

test('Assign', 'hello &&= false', false, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '&&=',
  right: {
    type: LITERAL,
    value: false,
  },
  type: ASSIGN,
}, {
  hello: true,
}, {
  hello: false,
})

test('Assign', 'hello &&= true', false, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '&&=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: ASSIGN,
}, {
  hello: false,
}, {
  hello: false,
})

test('Assign', 'hello ??= true', true, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '??=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: ASSIGN,
}, {
  hello: null,
}, {
  hello: true,
})

test('Assign', 'hello ??= true', true, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '??=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: ASSIGN,
}, {
  hello: undefined,
}, {
  hello: true,
})

test('Assign', 'hello ??= true', false, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '??=',
  right: {
    type: LITERAL,
    value: true,
  },
  type: ASSIGN,
}, {
  hello: false,
}, {
  hello: false,
})

// Arithmetic assignments.

test('Assign', 'hello **= 4', 16, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '**=',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: 16,
})

test('Assign', 'hello *= 4', 8, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '*=',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: 8,
})

test('Assign', 'hello /= 4', 0.5, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '/=',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: 0.5,
})

test('Assign', 'hello %= 4', 2, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '%=',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: 2,
})

test('Assign', 'hello %= 2', 0, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '%=',
  right: {
    type: LITERAL,
    value: 2,
  },
  type: ASSIGN,
}, {
  hello: 4,
}, {
  hello: 0,
})

test('Assign', 'hello += 4', 6, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '+=',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: 6,
})

test('Assign', 'hello -= 4', -2, {
  left: {
    name: 'hello',
    type: IDENTIFIER,
  },
  operator: '-=',
  right: {
    type: LITERAL,
    value: 4,
  },
  type: ASSIGN,
}, {
  hello: 2,
}, {
  hello: -2,
})
