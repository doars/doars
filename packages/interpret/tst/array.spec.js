import {
  IDENTIFIER,
  LITERAL,
  ARRAY_EXPRESSION,
  OBJECT_EXPRESSION,
  PROPERTY,
} from '../src/types.js'
import test from './utils/test.js'

test('Array', '[]', [], {
  elements: [],
  type: ARRAY_EXPRESSION,
})

test('Array', '[null]', [null], {
  elements: [{
    type: LITERAL,
    value: null,
  }],
  type: ARRAY_EXPRESSION,
})

test('Array', '[1]', [1], {
  elements: [{
    type: LITERAL,
    value: 1,
  }],
  type: ARRAY_EXPRESSION,
})

test('Array', '[1, 2]', [1, 2], {
  elements: [{
    type: LITERAL,
    value: 1,
  }, {
    type: LITERAL,
    value: 2,
  }],
  type: ARRAY_EXPRESSION,
})

test('Array', '[hello]', ['world'], {
  elements: [{
    name: 'hello',
    type: IDENTIFIER,
  }],
  type: ARRAY_EXPRESSION,
}, {
  hello: 'world',
}, {
  hello: 'world',
})

test('Array', '[hello, there]', ['general', 'kenobi'], {
  elements: [{
    name: 'hello',
    type: IDENTIFIER,
  }, {
    name: 'there',
    type: IDENTIFIER,
  }],
  type: ARRAY_EXPRESSION,
}, {
  hello: 'general',
  there: 'kenobi',
}, {
  hello: 'general',
  there: 'kenobi',
})

test('Array', '[[1], 2]', [[1], 2], {
  elements: [{
    elements: [{
      type: LITERAL,
      value: 1,
    }],
    type: ARRAY_EXPRESSION,
  }, {
    type: LITERAL,
    value: 2,
  }],
  type: ARRAY_EXPRESSION,
})

test('Array with object', '[{hello: "there"}]', [{
  hello: 'there',
}], {
  elements: [{
    properties: [{
      computed: false,
      key: {
        name: 'hello',
        type: IDENTIFIER,
      },
      shorthand: false,
      type: PROPERTY,
      value: {
        type: LITERAL,
        value: 'there',
      },
    }],
    type: OBJECT_EXPRESSION,
  }],
  type: ARRAY_EXPRESSION,
})
