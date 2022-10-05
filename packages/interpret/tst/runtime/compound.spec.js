import {
  LITERAL,
} from '../../src/types.js'
import test from './utilities/test.js'

test('Compound', '', undefined, undefined, {}, {}, {
  expectCompound: true
})

test('Compound', ';', undefined, undefined, {}, {}, {
  expectCompound: true
})

test('Compound', ';;', undefined, undefined, {}, {}, {
  expectCompound: true
})

test('Compound', ';;;', undefined, undefined, {}, {}, {
  expectCompound: true
})

test('Compound', '"hello";', ['hello'], [{
  type: LITERAL,
  value: 'hello',
}], {}, {}, {
  expectCompound: true
})

test('Compound', '"hello";"there"', ['hello', 'there'], [{
  type: LITERAL,
  value: 'hello',
}, {
  type: LITERAL,
  value: 'there',
}], {}, {}, {
  expectCompound: true
})

test('Compound', '"hello";"there";', ['hello', 'there'], [{
  type: LITERAL,
  value: 'hello',
}, {
  type: LITERAL,
  value: 'there',
}], {}, {}, {
  expectCompound: true
})
