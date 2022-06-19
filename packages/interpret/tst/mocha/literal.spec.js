import {
  LITERAL,
} from '../src/types.js'
import test from './utilities/test.js'

test('Literal', 'undefined', undefined, {
  type: LITERAL,
  value: undefined,
})

test('Literal', 'null', null, {
  type: LITERAL,
  value: null,
})

test('Literal', 'false', false, {
  type: LITERAL,
  value: false,
})

test('Literal', 'true', true, {
  type: LITERAL,
  value: true,
})

test('Literal', '1', 1, {
  type: LITERAL,
  value: 1,
})

test('Literal', '1.2', 1.2, {
  type: LITERAL,
  value: 1.2,
})

test('Literal', "'hello'", 'hello', {
  type: LITERAL,
  value: 'hello',
})

test('Literal', '"hello"', 'hello', {
  type: LITERAL,
  value: 'hello',
})
