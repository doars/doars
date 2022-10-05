import {
  ARRAY,
  IDENTIFIER,
  LITERAL,
  OBJECT,
  PROPERTY,
} from '../../src/types.js'
import test from './utilities/test.js'

test('Object', '{}', {}, {
  properties: [],
  type: OBJECT,
})

test('Object', '{ hello: "there" }', {
  hello: 'there',
}, {
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
})

test('Object', '{ hello: "there", general: "kenobi" }', {
  hello: 'there',
  general: 'kenobi',
}, {
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
  }, {
    computed: false,
    key: {
      name: 'general',
      type: IDENTIFIER,
    },
    shorthand: false,
    type: PROPERTY,
    value: {
      type: LITERAL,
      value: 'kenobi',
    },
  }],
  type: OBJECT,
})

test('Object', '{ hello }', {
  hello: 'there',
}, {
  properties: [{
    computed: false,
    key: {
      name: 'hello',
      type: IDENTIFIER,
    },
    shorthand: true,
    type: PROPERTY,
    value: {
      name: 'hello',
      type: IDENTIFIER,
    },
  }],
  type: OBJECT,
}, {
  hello: 'there',
}, {
  hello: 'there',
})

test('Object with object with object', '{ hello: { there: { general: "kenobi" } } }', {
  hello: {
    there: {
      general: 'kenobi',
    },
  },
}, {
  properties: [
    {
      computed: false,
      key: {
        name: 'hello',
        type: IDENTIFIER,
      },
      shorthand: false,
      type: PROPERTY,
      value: {
        properties: [
          {
            computed: false,
            key: {
              name: 'there',
              type: IDENTIFIER,
            },
            shorthand: false,
            type: PROPERTY,
            value: {
              properties: [
                {
                  computed: false,
                  key: {
                    name: 'general',
                    type: IDENTIFIER,
                  },
                  shorthand: false,
                  type: PROPERTY,
                  value: {
                    type: LITERAL,
                    value: 'kenobi',
                  },
                },
              ],
              type: OBJECT,
            },
          },
        ],
        type: OBJECT,
      },
    },
  ],
  type: OBJECT,
})

test('Object with array', '{ hello: ["there", "general", "kenobi"] }', {
  hello: [
    'there',
    'general',
    'kenobi',
  ],
}, {
  properties: [{
    computed: false,
    key: {
      name: 'hello',
      type: IDENTIFIER,
    },
    shorthand: false,
    type: PROPERTY,
    value: {
      elements: [{
        type: LITERAL,
        value: 'there',
      }, {
        type: LITERAL,
        value: 'general',
      }, {
        type: LITERAL,
        value: 'kenobi',
      }],
      type: ARRAY,
    },
  }],
  type: OBJECT,
})

test('Object with array', '{ hello: ["there", { general: "kenobi" }] }', {
  hello: [
    'there', {
      general: 'kenobi',
    },
  ],
}, {
  properties: [{
    computed: false,
    key: {
      name: 'hello',
      type: IDENTIFIER,
    },
    shorthand: false,
    type: PROPERTY,
    value: {
      elements: [{
        type: LITERAL,
        value: 'there',
      }, {
        properties: [
          {
            computed: false,
            key: {
              name: 'general',
              type: IDENTIFIER,
            },
            shorthand: false,
            type: PROPERTY,
            value: {
              type: LITERAL,
              value: 'kenobi',
            }
          }],
        type: OBJECT,
      }],
      type: ARRAY,
    },
  }],
  type: OBJECT,
})
