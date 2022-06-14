import {
  IDENTIFIER,
  LITERAL,
  MEMBER,
} from '../src/types.js'
import test from './utils/test.js'

test('Member', 'hello.there', 'general kenobi', {
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
}, {
  hello: {
    there: 'general kenobi',
  },
}, {
  hello: {
    there: 'general kenobi',
  },
})

test('Member', 'hello.there.general', 'kenobi', {
  computed: false,
  object: {
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
  property: {
    name: 'general',
    type: IDENTIFIER,
  },
  type: MEMBER,
}, {
  hello: {
    there: {
      general: 'kenobi',
    },
  },
}, {
  hello: {
    there: {
      general: 'kenobi',
    },
  },
})

test('Member computed', 'hello["there"]', 'general kenobi', {
  computed: true,
  object: {
    name: 'hello',
    type: IDENTIFIER,
  },
  property: {
    type: LITERAL,
    value: 'there',
  },
  type: MEMBER,
}, {
  hello: {
    there: 'general kenobi',
  },
}, {
  hello: {
    there: 'general kenobi',
  },
})

test('Member computed', 'hello[there]', 'kenobi', {
  computed: true,
  object: {
    name: 'hello',
    type: IDENTIFIER,
  },
  property: {
    name: 'there',
    type: IDENTIFIER,
  },
  type: MEMBER,
}, {
  hello: {
    general: 'kenobi'
  },
  there: 'general',
}, {
  hello: {
    general: 'kenobi'
  },
  there: 'general',
})
