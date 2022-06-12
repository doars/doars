import {
  IDENTIFIER,
} from '../../src/utils/Parse.js'
import InterpretTest from './InterpretTest.js'

(new InterpretTest('Identifier', 'hello', undefined, {
  'name': 'hello',
  'type': IDENTIFIER,
})).run();

(new InterpretTest('Identifier', '$hello', undefined, {
  'name': '$hello',
  'type': IDENTIFIER,
})).run();

(new InterpretTest('Identifier', '_hello', undefined, {
  'name': '_hello',
  'type': IDENTIFIER,
})).run();

(new InterpretTest('Identifier (context)', 'hello', 'there', {
  'name': 'hello',
  'type': IDENTIFIER,
}, {
  hello: 'there',
}, {
  hello: 'there',
})).run();
