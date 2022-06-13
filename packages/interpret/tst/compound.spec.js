import {
  LITERAL,
  COMPOUND,
} from '../src/types.js'
import test from './utils/test.js'

test('Compound', ';', undefined, undefined)

test('Compound', ';;', undefined, undefined)

test('Compound', ';;;', undefined, undefined)

test('Compound', '"hello";', 'hello', {
  type: LITERAL,
  value: 'hello',
})

test('Compound', '"hello";"there"', ['hello', 'there'], {
  body: [{
    type: LITERAL,
    value: 'hello',
  }, {
    type: LITERAL,
    value: 'there',
  }],
  type: COMPOUND,
})
