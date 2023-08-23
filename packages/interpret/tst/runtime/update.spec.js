import {
  IDENTIFIER,
  UPDATE,
} from '../../src/types.js'
import test from './utilities/test.js'

test('Update', '++hello', 2, {
  operator: '++',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  prefix: true,
  type: UPDATE,
}, {
  hello: 1,
}, {
  hello: 2,
})

test('Update', 'hello++', 1, {
  operator: '++',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  prefix: false,
  type: UPDATE,
}, {
  hello: 1,
}, {
  hello: 2,
})

test('Update', '--hello', 0, {
  operator: '--',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  prefix: true,
  type: UPDATE,
}, {
  hello: 1,
}, {
  hello: 0,
})

test('Update', 'hello--', 1, {
  operator: '--',
  parameter: {
    name: 'hello',
    type: IDENTIFIER,
  },
  prefix: false,
  type: UPDATE,
}, {
  hello: 1,
}, {
  hello: 0,
})
