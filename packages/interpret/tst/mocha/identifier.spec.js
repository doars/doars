import {
  IDENTIFIER,
} from '../src/types.js'
import test from './utilities/test.js'

test('Identifier', 'hello', undefined, {
  name: 'hello',
  type: IDENTIFIER,
})

test('Identifier', '$hello', undefined, {
  name: '$hello',
  type: IDENTIFIER,
})

test('Identifier', '_hello', undefined, {
  name: '_hello',
  type: IDENTIFIER,
})

test('Identifier from context', 'hello', 'there', {
  name: 'hello',
  type: IDENTIFIER,
}, {
  hello: 'there',
}, {
  hello: 'there',
})
