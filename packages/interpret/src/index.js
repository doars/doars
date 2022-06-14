import _parse from './parse.js'
import _run from './run.js'
import {
  ARRAY as _ARRAY,
  ASSIGN as _ASSIGN,
  BINARY as _BINARY,
  CALL as _CALL,
  CONDITION as _CONDITION,
  IDENTIFIER as _IDENTIFIER,
  LITERAL as _LITERAL,
  MEMBER as _MEMBER,
  OBJECT as _OBJECT,
  PROPERTY as _PROPERTY,
  SEQUENCE as _SEQUENCE,
  UNARY as _UNARY,
  UPDATE as _UPDATE,
} from './types.js'

export const interpret = (expression, context) => {
  return _run(_parse(expression), context)
}
export const parse = _parse
export const run = _run

export const ARRAY = _ARRAY
export const ASSIGN = _ASSIGN
export const BINARY = _BINARY
export const CALL = _CALL
export const CONDITION = _CONDITION
export const IDENTIFIER = _IDENTIFIER
export const LITERAL = _LITERAL
export const MEMBER = _MEMBER
export const OBJECT = _OBJECT
export const PROPERTY = _PROPERTY
export const SEQUENCE = _SEQUENCE
export const UNARY = _UNARY
export const UPDATE = _UPDATE

export default {
  interpret: interpret,
  parse: _parse,
  run: _run,

  ARRAY: _ARRAY,
  ASSIGN: _ASSIGN,
  BINARY: _BINARY,
  CALL: _CALL,
  CONDITION: _CONDITION,
  IDENTIFIER: _IDENTIFIER,
  LITERAL: _LITERAL,
  MEMBER: _MEMBER,
  OBJECT: _OBJECT,
  PROPERTY: _PROPERTY,
  SEQUENCE: _SEQUENCE,
  UNARY: _UNARY,
  UPDATE: _UPDATE,
}
