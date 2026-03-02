---
name: using-interpret
description: Reference for using the @doars/interpret CSP-safe JavaScript expression interpreter.
license: MIT
metadata:
  author: Ron Dekker <rondekker.nl>
---

# Using @doars/interpret

A CSP-safe JavaScript expression interpreter. Use when you need to evaluate expressions without `eval()` or `Function()` constructors, such as in environments with strict Content Security Policies or simply want to provide bettert sandboxing than the build in eval.

## When to use this skill

When evaluating expressions in environments with strict CSP (Content Security Policy). When you need a safer alternative to `eval()`. When parsing user-provided expressions securely. When implementing expression-based templating or configuration. When working with the Doars `interpret` expression processor.

```javascript
import { interpret, parse, run } from '@doars/interpret'

// One-step interpretation
const result = interpret('(x > 5) ? "big" : "small"', { x: 10 })
// result = ['big']

// Two-step: parse once, run multiple times
const ast = parse('user.name + " is " + user.age')
const user1 = run(ast, { user: { name: 'Alice', age: 30 } })
const user2 = run(ast, { user: { name: 'Bob', age: 25 } })
```

## API

| Function | Returns | Purpose |
|----------|---------|---------|
| `interpret(expression, context?)` | `any[]` | Parse and execute expression in one call |
| `parse(expression)` | `ASTNode[]` | Parse expression string into AST |
| `run(node, context?)` | `any[]` | Execute parsed AST with given context |

**Node type constants:** `ARROW`, `ARRAY`, `ASSIGN`, `BINARY`, `CALL`, `CONDITION`, `IDENTIFIER`, `LITERAL`, `MEMBER`, `OBJECT`, `PROPERTY`, `RETURN`, `SEQUENCE`, `SPREAD`, `TEMPLATE`, `UNARY`, `UPDATE`

> **Note:** `interpret` is simply `run(parse(expression), context)`

## Supported Features

**Values:** `null`, `undefined`, `true`, `false`, strings, template strings <code>\`hello ${world}\`</code>, numbers, regular expressions `/pattern/flags`, arrays `[]`, objects `{}`

**Operators:**
- Arithmetic: `+`, `-`, `*`, `/`, `%`, `**`
- Logical: `||`, `&&`, `??`
- Equality: `==`, `!=`, `===`, `!==`
- Relational: `<`, `>`, `<=`, `>=`
- Ternary: `condition ? a : b`
- Unary: `!`, `-`, `+`
- Update: `++x`, `x++`, `--x`, `x--`
- Assignment: `=`, `+=`, `-=`, `*=`, `/=`, `%=`, `**=`, `||=`, `&&=`, `??=`
- Bitwise: `&`, `|`, `^`, `~`, `<<`, `>>`, `>>>`

**Access:** Identifiers `foo`, member access `foo.bar`, computed access `foo[bar]` and `foo['there']`, optional chaining `foo?.bar` and `foo?.bar()`

**Calls:** `fn()`, `fn(a, b)`, with support for multiple expressions: `a(); b()`

**Arrow functions:** `() => 1`, `x => x`, `(x, y) => x + y`, `(x) => { return x * 2; }`. Parameters are bound from context values when auto-invoked at top level.

**Return:** `return 1` stops execution and returns a value. Only valid in top-level expressions or inside arrow function block bodies.

**Spread:** `...args` in array literals and function calls.

## Implicit behaviors

- **Always returns array:** Multiple expressions return all results; single expression returns array with one element
- **Context lookup:** All identifiers must exist in the provided context object or they'll resolve to `undefined`
- **Functions in context:** Must be provided via context; no global scope access
- **Left-hand assignment:** Only identifiers and member expressions can be assignment targets
- **No statements:** Only expressions supported (no `if`, `for`, etc.) - except `return` in arrow functions
- **Regular expressions:** Use `/pattern/flags` syntax

## Anti-patterns

Don't expect global scope access:
```javascript
interpret('Math.max(1, 2)') // Math is undefined
```

Provide needed functions in context:
```javascript
interpret('Math.max(1, 2)', { Math }) // Works
```

Don't use unsupported syntax - any expression must be valid to run by this library:
```javascript
interpret('class {}') // Class declarations not supported
interpret('function() {}') // Function declarations not supported
```

## Security Warning

Even without `eval()`, running arbitrary expressions is dangerous. Never execute user-provided expressions without strict validation, and avoid exposing sensitive functions in the context object.

## Full documentation

For detailed AST structure and advanced usage patterns, see [README.md](https://github.com/doars/doars/raw/refs/heads/main/packages/interpret/README.md).
