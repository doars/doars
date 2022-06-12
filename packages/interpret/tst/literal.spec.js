import {
  LITERAL,
} from '../../src/utils/Parse.js'
import InterpretTest from './InterpretTest.js'

(new InterpretTest('Literal', 'undefined', undefined, {
  'raw': 'undefined',
  'type': LITERAL,
  'value': undefined,
})).run();

(new InterpretTest('Literal', 'null', null, {
  'raw': 'null',
  'type': LITERAL,
  'value': null,
})).run();

(new InterpretTest('Literal', 'false', false, {
  'raw': 'false',
  'type': LITERAL,
  'value': false,
})).run();

(new InterpretTest('Literal', 'true', true, {
  'raw': 'true',
  'type': LITERAL,
  'value': true,
})).run();

(new InterpretTest('Literal', '1', 1, {
  'raw': '1',
  'type': LITERAL,
  'value': 1,
})).run();

(new InterpretTest('Literal', '1.2', 1.2, {
  'raw': '1.2',
  'type': LITERAL,
  'value': 1.2,
})).run();

(new InterpretTest('Literal', '"hello"', 'hello', {
  'raw': '"hello"',
  'type': LITERAL,
  'value': 'hello',
})).run();
