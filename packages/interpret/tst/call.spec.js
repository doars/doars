import {
  IDENTIFIER,
  LITERAL,
  PROPERTY,
  ARRAY_EXPRESSION,
  CALL_EXPRESSION,
  MEMBER_EXPRESSION,
  OBJECT_EXPRESSION,
} from '../src/types.js'
import test from './utils/test.js'

let callbackTemp

callbackTemp = () => 'there'
test('Call', 'hello()', 'there', {
  callee: {
    name: 'hello',
    type: IDENTIFIER,
  },
  parameters: [],
  type: CALL_EXPRESSION,
}, {
  hello: callbackTemp,
}, {
  hello: callbackTemp,
})

callbackTemp = (there) => there
test('Call parameter', 'hello("there")', 'there', {
  callee: {
    name: 'hello',
    type: IDENTIFIER,
  },
  parameters: [{
    type: LITERAL,
    value: 'there',
  }],
  type: CALL_EXPRESSION,
}, {
  hello: callbackTemp,
}, {
  hello: callbackTemp,
})

callbackTemp = (general, kenobi) => general + ' ' + kenobi
test('Call parameter', 'hello("general", "kenobi")', 'general kenobi', {
  callee: {
    name: 'hello',
    type: IDENTIFIER,
  },
  parameters: [{
    type: LITERAL,
    value: 'general',
  }, {
    type: LITERAL,
    value: 'kenobi',
  }],
  type: CALL_EXPRESSION,
}, {
  hello: callbackTemp,
}, {
  hello: callbackTemp,
})

callbackTemp = () => 'general kenobi'
test('Call parameter', 'hello.there()', 'general kenobi', {
  callee: {
    computed: false,
    object: {
      name: 'hello',
      type: IDENTIFIER,
    },
    property: {
      name: 'there',
      type: IDENTIFIER,
    },
    type: MEMBER_EXPRESSION,
  },
  parameters: [],
  type: CALL_EXPRESSION,
}, {
  hello: {
    there: callbackTemp,
  },
}, {
  hello: {
    there: callbackTemp,
  },
})

test('Call on array', '[1, 2].splice(1, 1)', [2], {
  callee: {
    computed: false,
    object: {
      elements: [{
        type: LITERAL,
        value: 1,
      }, {
        type: LITERAL,
        value: 2,
      }],
      type: ARRAY_EXPRESSION,
    },
    property: {
      name: 'splice',
      type: IDENTIFIER,
    },
    type: MEMBER_EXPRESSION,
  },
  parameters: [{
    type: LITERAL,
    value: 1,
  }, {
    type: LITERAL,
    value: 1,
  }],
  type: CALL_EXPRESSION,
})

test('Call on object', '({ hello: "there" }).hasOwnProperty("hello")', true, {
  callee: {
    computed: false,
    object: {
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
    },
    property: {
      name: 'hasOwnProperty',
      type: 2,
    },
    type: MEMBER_EXPRESSION,
  },
  parameters: [{
    type: LITERAL,
    value: 'hello',
  }],
  type: CALL_EXPRESSION,
})
