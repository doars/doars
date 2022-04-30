import { createContexts } from './ContextUtils.js'

// TODO: Parse expression and lookup on context instead of executing the code.

/*

- Numbers: 12
- Strings single quote: 'hello'
- Strings double quote: "hello"
- Objects: { hello: 'world' }
- Objects: { 'hello': 'world' }
- Object access using paths: hello.world
- Arrays: [ 'hello', 'world' ]
- Array/object access using values: hello[0]
- Calls: hello.world()
- Parameters: hello('world')
- Expression separation: x *= y; z = x
- Parenthesis: x * (y + z)
- Ternary operator: x ? y : z

Arithmetic operators
- Addition: x + y
- Subtraction: x - y
- Multiplication: x * y
- Division: x / y
- Remainder: x % y
- Increment: x++
- Decrement: x--
- Exponentiation: x ** y

Logical operators
- Logical AND: x && y
- Logical OR: x || y
- Logical nullish: x ?? y

Arithmetic assignment
- Assignment: x = y
- Addition: x += y
- Subtraction: x -= y
- Multiplication: x *= y
- Division: x /= y
- Remainder: x %= y
- Exponentiation: x **= y

Logical assignment
- Logical AND: x &&= y
- Logical OR: x ||= y
- Logical nullish: x ??= y

Comparison operators
- Equal: x == y
- Not equal: x != y
- Strict equal: x === y
- Strict not equal: x !== y
- Greater: x > y
- Greater or equal: x >= y
- Less: x < y
- Less or equal: x <= y

Operator precedence
| -------------------- | ------------------------------------- |
| Operator type        | Individual operators                  |
| -------------------- | ------------------------------------- |
| member               | . []                                  |
| call/create instance | ()                                    |
| negation/increment   | ! ~ - + ++ --                         |
| multiply/divide      | * / %                                 |
| addition/subtraction | + -                                   |
| relational           | < <= > >=                             |
| equality             | == != === !==                         |
| logical-and          | &&                                    |
| logical-or           | ||                                    |
| conditional          | ?:                                    |
| assignment           | = += -= *= /= %= &= ^= |= &&= ||= ??= |
| -------------------- | ------------------------------------- |

Source:
 - https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Expressions_and_Operators

*/

export const evaluate = null

export default {
  evaluate: evaluate,
}
