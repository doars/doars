import {
  ARRAY,
  IDENTIFIER,
  LITERAL,
  OBJECT,
  PROPERTY,
} from '../src/types.js'
import test from './utilities/test.js'

test('Array', '[]', [], {
  elements: [],
  type: ARRAY,
})

test('Array', '[null]', [null], {
  elements: [{
    type: LITERAL,
    value: null,
  }],
  type: ARRAY,
})

test('Array', '[1]', [1], {
  elements: [{
    type: LITERAL,
    value: 1,
  }],
  type: ARRAY,
})

test('Array', '[1, 2]', [1, 2], {
  elements: [{
    type: LITERAL,
    value: 1,
  }, {
    type: LITERAL,
    value: 2,
  }],
  type: ARRAY,
})

test('Array', '[hello]', ['world'], {
  elements: [{
    name: 'hello',
    type: IDENTIFIER,
  }],
  type: ARRAY,
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
  type: ARRAY,
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
    type: ARRAY,
  }, {
    type: LITERAL,
    value: 2,
  }],
  type: ARRAY,
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
    type: OBJECT,
  }],
  type: ARRAY,
})
