import {
  IDENTIFIER,
  LITERAL,
  UNARY,
} from '../src/types.js'
import test from './utils/test.js'

test('Unary', '+1', 1, {
  operator: '+',
  parameter: {
    type: LITERAL,
    value: 1,
  },
  type: UNARY,
})

test('Unary', '+hello', 1, {
  operator: '+',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  type: UNARY,
}, {
  hello: 1,
}, {
  hello: 1,
})

test('Unary', '-1', -1, {
  operator: '-',
  parameter: {
    type: LITERAL,
    value: 1,
  },
  type: UNARY,
})

test('Unary', '-hello', -1, {
  operator: '-',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  type: UNARY,
}, {
  hello: 1,
}, {
  hello: 1,
})

test('Unary', '!false', true, {
  operator: '!',
  parameter: {
    type: LITERAL,
    value: false,
  },
  type: UNARY,
})

test('Unary', '!true', false, {
  operator: '!',
  parameter: {
    type: LITERAL,
    value: true,
  },
  type: UNARY,
})

test('Unary', '!hello', true, {
  operator: '!',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  type: UNARY,
}, {
  hello: false,
}, {
  hello: false,
})

