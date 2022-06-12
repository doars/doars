import {
  LITERAL,
  BINARY_EXPRESSION
} from '../../src/utils/Parse.js'
import InterpretTest from './InterpretTest.js'

(new InterpretTest('Binary', '1 + 2', 3, {
  'left': {
    'raw': '1',
    'type': LITERAL,
    'value': 1,
  },
  'operator': '+',
  'right': {
    'raw': '2',
    'type': LITERAL,
    'value': 2,
  },
  'type': BINARY_EXPRESSION,
})).run();
