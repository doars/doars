// Based on jsep, v1.3.6, https://github.com/EricSmekens/jsep#readme).

import {
  COMPOUND,
  IDENTIFIER,
  LITERAL,
  PROPERTY,

  ARRAY_EXPRESSION,
  ASSIGN_EXPRESSION,
  BINARY_EXPRESSION,
  CALL_EXPRESSION,
  CONDITION_EXPRESSION,
  MEMBER_EXPRESSION,
  OBJECT_EXPRESSION,
  SEQUENCE_EXPRESSION,
  UNARY_EXPRESSION,
  UPDATE_EXPRESSION,
} from './types.js'

// Character codes.
const SPACE_CODES = [
  9, // Tab
  10, // LF
  13, // CR
  32, // Space
]
const OPENING_PARENTHESIS_CODE = 40 // (
const CLOSING_PARENTHESIS_CODE = 41 // )
const COMMA_CODE = 44 // ,
const PERIOD_CODE = 46 // .
const COLON_CODE = 58 // :
const QUESTION_MARK_CODE = 63 // ?
const OPENING_BRACKET_CODE = 91 // [
const CLOSING_BRACKET_CODE = 93 // ]
const CLOSING_BRACES_CODE = 125 // }

// Operators.
const ASSIGNMENT_OPERATORS = [
  '=',
  '*=',
  '**=',
  '/=',
  '%=',
  '+=',
  '-=',
  // '<<=',
  // '>>=',
  // '>>>=',
  // '&=',
  // '^=',
  // '|=',
]
const BINARY_OPERATORS = {
  '=': 1,
  '*=': 1,
  '**=': 1,
  '/=': 1,
  '%=': 1,
  '+=': 1,
  '-=': 1,
  // '<<=': 1,
  // '>>=': 1,
  // '>>>=': 1,
  // '&=': 1,
  // '^=': 1,
  // '|=': 1,
  '||': 2,
  '&&': 3,
  // '|': 4,
  // '^': 5,
  // '&': 6,
  '==': 7,
  '!=': 7,
  '===': 7,
  '!==': 7,
  '<': 8,
  '>': 8,
  '<=': 8,
  '>=': 8,
  // '<<': 9,
  // '>>': 9,
  // '>>>': 9,
  '*': 11,
  '/': 11,
  '%': 11,
  '+': 10,
  '-': 10,
}
const UNARY_OPERATORS = [
  '-',
  '!',
  // '~',
  '+',
]
const UPDATE_OPERATOR_DECREMENT = '--'
const UPDATE_OPERATOR_INCREMENT = '++'

// Literal lookup.
const LITERALS = {
  'true': true,
  'false': false,
  'null': null,
  'undefined': undefined,
}

const isDecimalDigit = (character) =>
  (character >= 48 && character <= 57) // Between 0 and 9

const isIdentifierPart = (character) =>
  isIdentifierStart(character) || isDecimalDigit(character)

const isIdentifierStart = (character) =>
  character === 36 // Dollar ($)
  || (character >= 48 && character <= 57) // Between 0 and 9
  || character === 95 // Underscore
  || (character >= 65 && character <= 90) // Between A and Z
  || (character >= 97 && character <= 122) // Between a and z

export const parse = (expression) => {
  let index = 0

  const gobbleArray = () => {
    index++

    return {
      type: ARRAY_EXPRESSION,
      elements: gobbleParameters(CLOSING_BRACKET_CODE)
    }
  }

  const gobbleParameters = (termination) => {
    const parameters = []
    let closed = false

    let separatorCount = 0
    while (index < expression.length) {
      gobbleSpaces()
      let characterIndex = expression.charCodeAt(index)

      if (characterIndex === termination) {
        closed = true
        index++

        if (termination === CLOSING_PARENTHESIS_CODE && separatorCount && separatorCount >= parameters.length) {
          throw new Error('Unexpected token ' + String.fromCharCode(termination))
        }
        break
      } else if (characterIndex === COMMA_CODE) {
        index++
        separatorCount++

        if (separatorCount !== parameters.length) {
          if (termination === CLOSING_PARENTHESIS_CODE) {
            throw new Error('Unexpected token ,')
          } else if (termination === CLOSING_BRACKET_CODE) {
            for (let i = parameters.length; i < separatorCount; i++) {
              parameters.push(null)
            }
          }
        }
      } else if (parameters.length !== separatorCount && separatorCount !== 0) {
        throw new Error('Expected comma')
      } else {
        const node = gobbleExpression()

        if (!node || node.type === COMPOUND) {
          throw new Error('Expected comma')
        }

        parameters.push(node)
      }
    }

    if (!closed) {
      throw new Error('Expected ' + String.fromCharCode(termination))
    }

    return parameters
  }

  const gobbleBinaryExpression = () => {
    let left = gobbleToken()
    if (!left) {
      return left
    }

    let operator = gobbleBinaryOperation()
    if (!operator) {
      return left
    }

    let binaryOperationInfo = {
      value: operator,
      precedence: BINARY_OPERATORS[operator] || 0,
    }

    let right = gobbleToken()
    if (!right) {
      throw new Error('Expected expression after ' + operator)
    }

    const stack = [
      left,
      binaryOperationInfo,
      right,
    ]

    let node
    while ((operator = gobbleBinaryOperation())) {
      const precedence = BINARY_OPERATORS[operator] || 0

      if (precedence === 0) {
        index -= operator.length
        break
      }

      binaryOperationInfo = {
        value: operator,
        precedence: precedence,
      }

      const currentBinaryOperation = operator
      while (stack.length > 2 && stack[stack.length - 2] > precedence) {
        right = stack.pop()
        operator = stack.pop().value
        left = stack.pop()
        node = {
          type: ASSIGNMENT_OPERATORS.indexOf(operator) >= 0
            ? ASSIGN_EXPRESSION
            : BINARY_EXPRESSION,
          operator: operator,
          left,
          right,
        }
        stack.push(node)
      }

      node = gobbleToken()

      if (!node) {
        throw new Error('Expected expression after ' + currentBinaryOperation)
      }

      stack.push(binaryOperationInfo, node)
    }

    let i = stack.length - 1
    node = stack[i]

    while (i > 1) {
      operator = stack[i - 1].value
      node = {
        type: ASSIGNMENT_OPERATORS.indexOf(operator) >= 0
          ? ASSIGN_EXPRESSION
          : BINARY_EXPRESSION,
        operator: operator,
        left: stack[i - 2],
        right: node,
      }
      i -= 2
    }

    return node
  }

  const gobbleBinaryOperation = () => {
    gobbleSpaces()
    let toCheck = expression.substring(index, index + 3) // 3 = Maximum binary operator length.
    let toCheckLength = toCheck.length

    while (toCheckLength > 0) {
      if (BINARY_OPERATORS.hasOwnProperty(toCheck) && (
        !isIdentifierStart(expression.charCodeAt(index)) ||
        (index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))
      )) {
        index += toCheckLength
        return toCheck
      }
      toCheck = toCheck.substring(0, --toCheckLength)
    }
    return false
  }

  const gobbleExpression = () => {
    let node = gobbleBinaryExpression()
    gobbleSpaces()
    node = gobbleTernary(node)
    return node
  }

  const gobbleExpressions = (untilCharacterCode) => {
    let nodes = []
    while (index < expression.length) {
      const characterIndex = expression.charCodeAt(index)
      if (
        characterIndex === 59 // Semicolon (;)
        || characterIndex === COMMA_CODE
      ) {
        index++
      } else {
        const node = gobbleExpression()
        if (node) {
          nodes.push(node)
        } else if (index < expression.length) {
          if (characterIndex === untilCharacterCode) {
            break
          }
          throw new Error('Unexpected "' + expression.charAt(index) + '"')
        }
      }
    }
    return nodes
  }

  const gobbleIdentifier = () => {
    let character = expression.charCodeAt(index), start = index

    if (isIdentifierStart(character)) {
      index++
    } else {
      throw new Error('Unexpected ' + expression.charAt(index))
    }

    while (index < expression.length) {
      character = expression.charCodeAt(index)

      if (isIdentifierPart(character)) {
        index++
      } else {
        break
      }
    }
    return {
      type: IDENTIFIER,
      name: expression.slice(start, index),
    }
  }

  const gobbleNumericLiteral = () => {
    let number = ''
    while (isDecimalDigit(expression.charCodeAt(index))) {
      number += expression.charAt(index++)
    }
    if (expression.charCodeAt(index) === PERIOD_CODE) {
      number += expression.charAt(index++)
      while (isDecimalDigit(expression.charCodeAt(index))) {
        number += expression.charAt(index++)
      }
    }

    let character = expression.charAt(index)
    if (character === 'e' || character === 'E') {
      number += expression.charAt(index++)
      character = expression.charAt(index)

      if (character === '+' || character === '-') {
        number += expression.charAt(index++)
      }

      while (isDecimalDigit(expression.charCodeAt(index))) {
        number += expression.charAt(index++)
      }

      if (!isDecimalDigit(expression.charCodeAt(index - 1))) {
        throw new Error('Expected exponent (' + number + expression.charAt(index) + ')')
      }
    }

    const characterCode = expression.charCodeAt(index)
    if (isIdentifierStart(characterCode)) {
      throw new Error('Variable names cannot start with a number (' + number + expression.charAt(index) + ')')
    } else if (
      characterCode === PERIOD_CODE
      || (
        number.length === 1
        && number.charCodeAt(0) === PERIOD_CODE
      )
    ) {
      throw new Error('Unexpected period')
    }

    return {
      type: LITERAL,
      value: parseFloat(number),
      raw: number,
    }
  }

  const gobbleObjectExpression = () => {
    // Check if opening brace "{"
    if (expression.charCodeAt(index) !== 123) {
      return
    }
    index++

    const properties = []
    while (!isNaN(expression.charCodeAt(index))) {
      gobbleSpaces()
      if (expression.charCodeAt(index) === CLOSING_BRACES_CODE) {
        index++
        return gobbleTokenProperty({
          type: OBJECT_EXPRESSION,
          properties,
        })
      }

      const key = gobbleToken()
      if (!key) {
        throw new Error('missing }')
      }
      gobbleSpaces()

      if (
        key.type === IDENTIFIER
        && (
          expression.charCodeAt(index) === COMMA_CODE
          || expression.charCodeAt(index) === CLOSING_BRACES_CODE
        )
      ) {
        properties.push({
          type: PROPERTY,
          computed: false,
          key: key,
          value: key,
          shorthand: true,
        })
      } else if (expression.charCodeAt(index) === COLON_CODE) {
        index++
        const value = gobbleExpression()
        if (!value) {
          throw new Error('unexpected object property')
        }

        const computed = key.type === ARRAY_EXPRESSION
        properties.push({
          computed: computed,
          key: computed
            ? key.elements[0]
            : key,
          shorthand: false,
          type: PROPERTY,
          value: value,
        })
        gobbleSpaces()
      } else if (key) {
        properties.push(key)
      }

      if (expression.charCodeAt(index) === COMMA_CODE) {
        index++
      }
    }
    throw new Error('missing }')
  }

  const gobbleSequence = () => {
    index++

    const nodes = gobbleExpressions(CLOSING_PARENTHESIS_CODE)
    if (expression.charCodeAt(index) === CLOSING_PARENTHESIS_CODE) {
      index++

      if (nodes.length === 1) {
        return nodes[0]
      }
      if (!nodes.length) {
        return false
      }

      return {
        type: SEQUENCE_EXPRESSION,
        expressions: nodes,
      }
    }

    throw new Error('Unclosed (')
  }

  const gobbleSpaces = () => {
    while (SPACE_CODES.indexOf(expression.charCodeAt(index)) >= 0) {
      index++
    }
  }

  const gobbleStringLiteral = () => {
    let string = ''
    const startIndex = index
    const quote = expression.charAt(index++)
    let closed = false

    while (index < expression.length) {
      let character = expression.charAt(index++)

      if (character === quote) {
        closed = true
        break
      }
      if (character === '\\') {
        character = expression.charAt(index++)

        switch (character) {
          case 'n':
            string += '\n'
            break

          case 'r':
            string += '\r'
            break

          case 't':
            string += '\t'
            break

          case 'b':
            string += '\b'
            break

          case 'f':
            string += '\f'
            break

          case 'v':
            string += '\x0B'
            break

          default:
            string += character
        }
      } else {
        string += character
      }
    }

    if (!closed) {
      throw new Error('Unclosed quote after "' + string + '"')
    }

    return {
      type: LITERAL,
      value: string,
      raw: expression.substring(startIndex, index),
    }
  }

  const gobbleTernary = (node) => {
    if (!node || expression.charCodeAt(index) !== QUESTION_MARK_CODE) {
      return node
    }
    index++

    const consequent = gobbleExpression()
    if (!consequent) {
      throw new Error('Expected expression');
    }

    gobbleSpaces()

    if (!expression.charCodeAt(index) === COLON_CODE) {
      throw new Error('Expected :')
    }
    index++

    const alternate = gobbleExpression()
    if (!alternate) {
      throw new Error('Expected expression')
    }

    const conditional = {
      type: CONDITION_EXPRESSION,
      condition: node,
      consequent: consequent,
      alternate: alternate,
    }

    if (node.operator && BINARY_OPERATORS[node.operator] <= 1) {
      let newCondition = node
      while (newCondition.right.operator && BINARY_OPERATORS[newCondition.right.operator] <= 1) {
        newCondition = newCondition.right
      }
      conditional.condition = newCondition.right
      newCondition.right = conditional
      conditional = node
    }

    return conditional
  }

  const gobbleToken = () => {
    let node = gobbleObjectExpression() || gobbleUpdatePrefixExpression()
    if (node) {
      return gobbleUpdateSuffixExpression(node)
    }
    gobbleSpaces()

    const character = expression.charCodeAt(index)
    if (isDecimalDigit(character) || character === PERIOD_CODE) {
      return gobbleNumericLiteral()
    }

    if (character === 34 || character === 39) { // Double quote (") or single quote (')
      node = gobbleStringLiteral()
    } else if (character === OPENING_BRACKET_CODE) {
      node = gobbleArray()
    } else {
      let toCheck = expression.substring(index, index + 1) // 1 = Maximum unary operator length.
      let toCheckLength = toCheck.length

      while (toCheckLength > 0) {
        if (UNARY_OPERATORS.indexOf(toCheck) >= 0 && (
          !isIdentifierStart(expression.charCodeAt(index)) ||
          (index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))
        )) {
          index += toCheckLength
          const parameter = gobbleToken()
          if (!parameter) {
            throw new Error('Missing unary operation parameter')
          }
          return gobbleUpdateSuffixExpression({
            type: UNARY_EXPRESSION,
            operator: toCheck,
            parameter: parameter,
          })
        }

        toCheck = toCheck.substr(0, --toCheckLength)
      }

      if (isIdentifierStart(character)) {
        node = gobbleIdentifier()
        if (LITERALS.hasOwnProperty(node.name)) {
          node = {
            type: LITERAL,
            value: LITERALS[node.name],
            raw: node.name,
          }
        }
      } else if (character === OPENING_PARENTHESIS_CODE) {
        node = gobbleSequence()
      }
    }

    return gobbleUpdateSuffixExpression(
      gobbleTokenProperty(node)
    )
  }

  const gobbleTokenProperty = (node) => {
    gobbleSpaces()

    let character = expression.charCodeAt(index)
    while (
      character === PERIOD_CODE
      || character === OPENING_BRACKET_CODE
      || character === OPENING_PARENTHESIS_CODE
      || character === QUESTION_MARK_CODE
    ) {
      let optional
      if (character === QUESTION_MARK_CODE) {
        if (expression.charCodeAt(index + 1) !== PERIOD_CODE) {
          break
        }
        optional = true
        index += 2
        gobbleSpaces()
        character = expression.charCodeAt(index)
      }
      index++

      if (character === OPENING_BRACKET_CODE) {
        node = {
          type: MEMBER_EXPRESSION,
          computed: true,
          object: node,
          property: gobbleExpression(),
        }
        gobbleSpaces()
        character = expression.charCodeAt(index)
        if (character !== CLOSING_BRACKET_CODE) {
          throw new Error('Unclosed [')
        }
        index++
      } else if (character === OPENING_PARENTHESIS_CODE) {
        node = {
          type: CALL_EXPRESSION,
          parameters: gobbleParameters(CLOSING_PARENTHESIS_CODE),
          callee: node,
        }
      } else if (character === PERIOD_CODE || optional) {
        if (optional) {
          index--
        }
        gobbleSpaces()
        node = {
          type: MEMBER_EXPRESSION,
          computed: false,
          object: node,
          property: gobbleIdentifier(),
        }
      }

      if (optional) {
        node.optional = true
      }

      gobbleSpaces()
      character = expression.charCodeAt(index)
    }

    return node
  }

  const gobbleUpdatePrefixExpression = () => {
    if (index + 1 >= expression.length) {
      return
    }

    const characters = expression.substring(index, index + 2) // 2 = Maximum update expression length
    let operator = null
    if (characters === UPDATE_OPERATOR_DECREMENT) {
      operator = UPDATE_OPERATOR_DECREMENT
    } else if (characters === UPDATE_OPERATOR_INCREMENT) {
      operator = UPDATE_OPERATOR_INCREMENT
    } else {
      return
    }

    index += 2
    let node = {
      type: UPDATE_EXPRESSION,
      operator: operator,
      parameter: gobbleTokenProperty(gobbleIdentifier()),
      prefix: true,
    }
    if (!node.parameter || (node.parameter.type !== IDENTIFIER && node.parameter.type !== MEMBER_EXPRESSION)) {
      throw new Error(`Unexpected ${env.node.operator}`);
    }
    return node
  }

  const gobbleUpdateSuffixExpression = (node) => {
    if (!node || index + 1 >= expression.length) {
      return node
    }

    const characters = expression.substring(index, index + 2)
    let operator = null
    if (characters === UPDATE_OPERATOR_DECREMENT) {
      operator = UPDATE_OPERATOR_DECREMENT
    } else if (characters === UPDATE_OPERATOR_INCREMENT) {
      operator = UPDATE_OPERATOR_INCREMENT
    } else {
      return node
    }

    index += 2
    node = {
      type: UPDATE_EXPRESSION,
      operator: operator,
      parameter: node,
      prefix: false,
    }
    return node
  }

  const nodes = gobbleExpressions()
  return nodes.length === 1
    ? nodes[0]
    : {
      type: COMPOUND,
      body: nodes,
    }
}

export default {
  parse: parse,
}
