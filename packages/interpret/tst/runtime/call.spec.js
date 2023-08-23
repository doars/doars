import {
  ARRAY,
  CALL,
  IDENTIFIER,
  LITERAL,
  MEMBER,
  OBJECT,
  PROPERTY,
} from '../../src/types.js'
import test from './utilities/test.js'

let callbackTemp

callbackTemp = () => 'there'
test('Call', 'hello()', 'there', {
  callee: {
    name: 'hello',
    type: IDENTIFIER,
  },
  parameters: [],
  type: CALL,
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
  type: CALL,
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
  type: CALL,
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
    type: MEMBER,
  },
  parameters: [],
  type: CALL,
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
      type: ARRAY,
    },
    property: {
      name: 'splice',
      type: IDENTIFIER,
    },
    type: MEMBER,
  },
  parameters: [{
    type: LITERAL,
    value: 1,
  }, {
    type: LITERAL,
    value: 1,
  }],
  type: CALL,
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
      type: OBJECT,
    },
    property: {
      name: 'hasOwnProperty',
      type: 2,
    },
    type: MEMBER,
  },
  parameters: [{
    type: LITERAL,
    value: 'hello',
  }],
  type: CALL,
})
