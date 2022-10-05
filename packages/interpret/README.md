<div align="center">

[![npm @latest version](https://img.shields.io/npm/v/@doars/interpret.svg?label=Version&style=flat-square&maxAge=86400)](https://www.npmjs.com/package/@doars/interpret)

</div>

<hr/>

# @doars/interpret

Interpret a subset JavaScript expression without using the [`eval` function](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/eval) or [`Function` constructor](https://developer.mozilla.org/docs/Web/JavaScript/Reference/Global_Objects/Function/Function). Allowing it to be used in combination with a strict [Content Security Policy](https://developer.mozilla.org/docs/Web/HTTP/Headers/Content-Security-Policy) that does not contain the `unsafe-eval` option.

The interpreter is written for the [@doars/doars library](https://doars.dev), but can be used elsewhere as well. The features it support are meant to be simple and not allow for much complexity similar to what a formulae in a spreadsheet can do.

Even though the library does not use the `eval` function or `Function` constructor security is still an importtent concern when interpreting any code. Do not provide any functions via the `context` parameter that could cause harm and it is not recommended to run any expression that might contain user input. So do take the accompanying risks into consideration before using this library.

## Install

### From NPM

Install the package from NPM, then import and use it.

```
npm i @doars/interpret
```

```JavaScript
// Import library.
import { interpret, parse, run } from '@doars/interpret'

// Interpret expression.
const resultOne = interpret(
  '(hello == 3) ? "there" : general', // Expression.
  { hello: 4, general: 'kenobi' } // Context.
)
// resultOne = 'kenobi'

// Or interpret in separate steps.
// Parse the expression first.
const node = parse('(hello == 3) ? "there" : general')
// Then run the node.
const resultTwo = run(node, { hello: 4, general: 'kenobi' })
// resultTwo = 'kenobi'
```

## API

Exported functions:

- `interpret` Interpret an expression.
  - `@param {string} expression` Expression to interpret.
  - `@param {Object} context` Context of the expression.
  - `@returns {Array}` results of the expression.
- `parse` Parse an expression.
  - `@param {string} expression` Expression to parse.
  - `@returns {Object}` The parsed expression.
- `run` Run a parsed expression.
  - `@param {Object} node` Parsed expression.
  - `@param {Object} context` Context of the expression.
  - `@returns {Array}` results of the expression.

The following node types are exported as variables: `ARRAY`, `ASSIGN`, `BINARY`, `CALL`, `CONDITION`, `IDENTIFIER`, `LITERAL`, `MEMBER`, `OBJECT`, `PROPERTY`, `SEQUENCE`, `UNARY`, `UPDATE`.

> `interpret` is simply a short hand for `run(parse(expression), context)`.

## Supported features

The interpret does not support all JavaScript features. However any expression valid to be run by this library should also be valid JavaScript code. That being said the interpreter might ignore some syntax errors that are usually not allowed.

- Identifiers and member access: `hello`, `hello.there`, `hello[there]` and `hello['there']`. Any identifiers need te be given via the context parameter when running the expression.
- Function calls: `hello()`, `hello(there)` and `hello('there', 'general', 'kenobi')`. Any functions need te be given via the context parameter when running the expression.
- Multiple clauses: `hello(); world()`. The result of each expression is returned, hence the `interpret` and `run` functions always return an array.

As well as several value types and most operators. See an overview below for more information.

### Value types

- Null: `null`.
- Undefined: `undefined`.
- Booleans: `false` and `true`.
- Strings: `'hello'` and `"there"`.
- Numbers: `1` and `12.3`.
- Arrays: `[]`, `['hello']` `['hello', 'there']`.
- Objects: `{}`, `{ hello: 'there' }`, `{ hello: 'there', general: 'kenobi' }`, `{ [hello]: 'there' }`, `{ hello }` and `{ hello, there }`.

### Operators

- Arithmetic: `2 ** 3`, as well as `*`, `/`, `%`, `+`, and `-`.
- Logical: `false || true`, as well as `&&` and `??`.
- Equality: `true == false`, as well as `!=`, `===`, and `!==`.
- Relation: `1 > 0`, as well as `>`, `<=`, and `>=`.
- Ternary: `true ? 0 : 1`.
- Unary: `+1` as well as `-1` and `!false`.
- Decrement and increment: `--hello` as well as `hello--`, `++hello` and `hello++`.
- Assignment: `hello = 'there'`.
- Arithmetic assignment: `hello **= 2` as well as `*=`, `/=`, `%=`, `+=`, and `-=`.
- Logical assignment: `hello ||= 'there'` as well as `&&=` and `??=`.

## Known issues

- Unable to define objects in objects: `{ hello: {} }`.
