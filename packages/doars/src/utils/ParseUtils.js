// Based on jsep, v1.3.6, https://github.com/EricSmekens/jsep#readme).

// Node types.
export const COMPOUND = 1
export const IDENTIFIER = 2
export const LITERAL = 3
export const PROPERTY = 4
// Node expression types.
export const ARRAY_EXPRESSION = 5
export const ASSIGNMENT_EXPRESSION = 6
export const BINARY_EXPRESSION = 7
export const CALL_EXPRESSION = 8
export const CONDITIONAL_EXPRESSION = 9
export const MEMBER_EXPRESSION = 10
export const OBJECT_EXPRESSION = 11
export const SEQUENCE_EXPRESSION = 12
export const UNARY_EXPRESSION = 13
export const UPDATE_EXPRESSION = 14

// Character codes.
const TAB_CODE = 9
const LF_CODE = 10
const CR_CODE = 13
const SPACE_CODE = 32
const DOUBLE_QUOTE_CODE = 34 // "
const DOLLAR_CODE = 36 // $
const SINGLE_QUOTE_CODE = 39 // '
const OPENING_PARENTHESIS_CODE = 40 // (
const CLOSING_PARENTHESIS_CODE = 41 // )
const PLUS_CODE = 43 // +
const COMMA_CODE = 44 // ,
const MINUS_CODE = 45 // -
const PERIOD_CODE = 46 // .
const ZERO_CODE = 48 // 0
const NINE_CODE = 57 // 9
const COLON_CODE = 58 // :
const SEMICOLON_CODE = 59 // ;
const EQUAL_CODE = 61 // =
const QUESTION_MARK_CODE = 63 // ?
const UPPERCASE_A_CODE = 48 // A
const UPPERCASE_Z_CODE = 57 // Z
const OPENING_BRACKET_CODE = 91 // [
const CLOSING_BRACKET_CODE = 93 // ]
const UNDERSCORE_CODE = 95 // _
const LOWERCASE_A_CODE = 97 // a
const LOWERCASE_Z_CODE = 122 // z
const OPENING_BRACES_CODE = 123 // {
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
  '+': 10,
  '-': 10,
  '*': 11,
  '/': 11,
  '%': 11,
}
const MAX_BINARY_OPERATOR_LENGTH = 3
const UNARY_OPERATORS = [
  '-',
  '!',
  // '~',
  '+',
]
const MAX_UNARY_OPERATOR_LENGTH = 1
const UPDATE_OPERATOR_DECREMENT = '--'
const UPDATE_OPERATOR_INCREMENT = '++'

// Literal lookup.
const LITERALS = {
  'true': true,
  'false': false,
  'null': null,
}

const isDecimalDigit = (character) =>
  (character >= ZERO_CODE && character <= NINE_CODE)

const binaryPrecedence = (operationValue) =>
  BINARY_OPERATORS[operationValue] || 0

const isIdentifierStart = (character) =>
  character === DOLLAR_CODE
  || (character >= UPPERCASE_A_CODE && character <= UPPERCASE_Z_CODE)
  || character === UNDERSCORE_CODE
  || (character >= LOWERCASE_A_CODE && character <= LOWERCASE_Z_CODE)
  || (character >= 128 && !BINARY_OPERATORS[String.fromCharCode(character)])

const isIdentifierPart = (character) =>
  isIdentifierStart(character) || isDecimalDigit(character)

export const parse = (expression) => {
  let index = 0

  const throwError = (message) => {
    const error = new Error(message + ' at character ' + index)
    error.index = index
    error.description = message
    throw error
  }

  const gobbleArray = () => {
    index++

    return {
      type: ARRAY_EXPRESSION,
      elements: gobbleArguments(CLOSING_BRACKET_CODE)
    }
  }

  const gobbleArguments = (termination) => {
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
          throwError('Unexpected token ' + String.fromCharCode(termination))
        }
        break
      } else if (characterIndex === COMMA_CODE) {
        index++
        separatorCount++

        if (separatorCount !== parameters.length) {
          if (termination === CLOSING_PARENTHESIS_CODE) {
            throwError('Unexpected token ,')
          } else if (termination === CLOSING_BRACKET_CODE) {
            for (let i = parameters.length; i < separatorCount; i++) {
              parameters.push(null)
            }
          }
        }
      } else if (parameters.length !== separatorCount && separatorCount !== 0) {
        throwError('Expected comma')
      } else {
        const node = gobbleExpression()

        if (!node || node.type === COMPOUND) {
          throwError('Expected comma')
        }

        parameters.push(node)
      }
    }

    if (!closed) {
      throwError('Expected ' + String.fromCharCode(termination))
    }

    return parameters
  }

  const gobbleBinaryExpression = () => {
    let node, operator, precedence, stack, binaryOperationInfo, left, right, i, currentBinaryOperation

    left = gobbleToken()
    if (!left) {
      return left
    }

    operator = gobbleBinaryOperation()
    if (!operator) {
      return left
    }

    binaryOperationInfo = {
      value: operator,
      precedence: binaryPrecedence(operator),
    }

    right = gobbleToken()
    if (!right) {
      throwError('Expected expression after ' + operator)
    }

    stack = [
      left,
      binaryOperationInfo,
      right,
    ]

    while ((operator = gobbleBinaryOperation())) {
      precedence = binaryPrecedence(operator)

      if (precedence === 0) {
        index -= operator.length
        break
      }

      binaryOperationInfo = {
        value: operator,
        precedence: precedence,
      }

      currentBinaryOperation = operator

      const comparePrevious = previous => precedence <= previous.precedence
      while ((stack.length > 2) && comparePrevious(stack[stack.length - 2])) {
        right = stack.pop()
        operator = stack.pop().value
        left = stack.pop()
        node = {
          type: ASSIGNMENT_OPERATORS.indexOf(operator) >= 0
            ? ASSIGNMENT_EXPRESSION
            : BINARY_EXPRESSION,
          operator: operator,
          left,
          right
        }
        stack.push(node)
      }

      node = gobbleToken()

      if (!node) {
        throwError('Expected expression after ' + currentBinaryOperation)
      }

      stack.push(binaryOperationInfo, node)
    }

    i = stack.length - 1
    node = stack[i]

    while (i > 1) {
      operator = stack[i - 1].value
      node = {
        type: ASSIGNMENT_OPERATORS.indexOf(operator) >= 0
          ? ASSIGNMENT_EXPRESSION
          : BINARY_EXPRESSION,
        operator: operator,
        left: stack[i - 2],
        right: node
      }
      i -= 2
    }

    return node
  }

  const gobbleBinaryOperation = () => {
    gobbleSpaces()
    let toCheck = expression.substring(index, index + MAX_BINARY_OPERATOR_LENGTH)
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

  const gobbleExpressions = () => {
    let nodes = [], characterIndex, node

    while (index < expression.length) {
      characterIndex = expression.charCodeAt(index)

      if (
        characterIndex === SEMICOLON_CODE
        || characterIndex === COMMA_CODE
      ) {
        index++
      } else {
        node = gobbleExpression()
        if (node) {
          nodes.push(node)
        } else if (index < expression.length) {
          if (characterIndex === undefined) {
            break
          }
          throwError('Unexpected "' + expression.charAt(index) + '"')
        }
      }
    }

    return nodes
  }

  const gobbleGroup = () => {
    index++
    let nodes = gobbleExpressions(CLOSING_PARENTHESIS_CODE)
    if (expression.charCodeAt(index) === CLOSING_PARENTHESIS_CODE) {
      index++
      if (nodes.length === 1) {
        return nodes[0]
      } else if (!nodes.length) {
        return false
      }
      return {
        type: SEQUENCE_EXPRESSION,
        expressions: nodes,
      }
    }
    throwError('Unclosed (')
  }

  const gobbleIdentifier = () => {
    let character = expression.charCodeAt(index), start = index

    if (isIdentifierStart(character)) {
      index++
    } else {
      throwError('Unexpected ' + expression.charAt(index))
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
    let number = '', character, characterCode

    while (isDecimalDigit(expression.charCodeAt(index))) {
      number += expression.charAt(index++)
    }

    if (expression.charCodeAt(index) === PERIOD_CODE) {
      number += expression.charAt(index++)

      while (isDecimalDigit(expression.charCodeAt(index))) {
        number += expression.charAt(index++)
      }
    }

    character = expression.charAt(index)

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
        throwError('Expected exponent (' + number + expression.charAt(index) + ')')
      }
    }

    characterCode = expression.charCodeAt(index)

    if (isIdentifierStart(characterCode)) {
      throwError('Variable names cannot start with a number (' + number + expression.charAt(index) + ')')
    } else if (
      characterCode === PERIOD_CODE
      || (
        number.length === 1
        && number.charCodeAt(0) === PERIOD_CODE
      )
    ) {
      throwError('Unexpected period')
    }

    return {
      type: LITERAL,
      value: parseFloat(number),
      raw: number
    }
  }

  const gobbleObjectExpression = () => {
    if (expression.charCodeAt(index) !== OPENING_BRACES_CODE) {
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

      const key = gobbleExpression()
      if (!key) {
        throwError('missing }')
        return
      }

      gobbleSpaces();
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
          throwError('unexpected object property')
        }
        const computed = key.type === ARRAY_EXPRESSION
        properties.push({
          type: PROPERTY,
          computed,
          key: computed
            ? key.elements[0]
            : key,
          value: value,
          shorthand: false,
        })
        gobbleSpaces()
      } else if (key) {
        properties.push(key)
      }

      if (expression.charCodeAt(index) === COMMA_CODE) {
        index++
      }
    }
    throwError('missing }')
  }

  const gobbleSpaces = () => {
    let character = expression.charCodeAt(index)
    while (
      character === SPACE_CODE
      || character === TAB_CODE
      || character === LF_CODE
      || character === CR_CODE
    ) {
      character = expression.charCodeAt(++index)
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
      } else if (character === '\\') {
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
      throwError('Unclosed quote after "' + string + '"')
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
      throwError('Expected expression');
    }

    gobbleSpaces()

    if (!expression.charCodeAt(index) === COLON_CODE) {
      throwError('Expected :')
    }
    index++

    const alternate = gobbleExpression()
    if (!alternate) {
      throwError('Expected expression')
    }

    conditional = {
      type: CONDITIONAL_EXPRESSION,
      test: node,
      consequent: consequent,
      alternate: alternate,
    }

    if (node.operator && BINARY_OPERATORS[test.operator] <= 1) {
      let newTest = test
      while (newTest.right.operator && BINARY_OPERATORS[newTest.right.operator] <= 1) {
        newTest = newTest.right
      }
      conditional.test = newTest.right
      newTest.right = conditional
      conditional = test
    }

    return conditional
  }

  const gobbleToken = () => {
    let character, toCheck, toCheckLength, node

    node = gobbleObjectExpression() || gobbleUpdatePrefixExpression()
    if (node) {
      return gobbleUpdateSuffixExpression(node)
    }

    gobbleSpaces()

    character = expression.charCodeAt(index)

    if (isDecimalDigit(character) || character === PERIOD_CODE) {
      return gobbleNumericLiteral()
    }

    if (character === SINGLE_QUOTE_CODE || character === DOUBLE_QUOTE_CODE) {
      node = gobbleStringLiteral()
    } else if (character === OPENING_BRACKET_CODE) {
      node = gobbleArray()
    } else {
      toCheck = expression.substring(index, index + MAX_UNARY_OPERATOR_LENGTH)
      toCheckLength = toCheck.length

      while (toCheckLength > 0) {
        if (UNARY_OPERATORS.indexOf(toCheck) >= 0 && (
          !isIdentifierStart(expression.charCodeAt(index)) ||
          (index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))
        )) {
          index += toCheckLength
          const argument = gobbleToken()
          if (!argument) {
            throwError('Missing unary operation argument')
          }
          return gobbleUpdateSuffixExpression({
            type: UNARY_EXPRESSION,
            operator: to_check,
            argument,
            prefix: true,
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
        node = gobbleGroup()
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
          property: gobbleExpression()
        }
        gobbleSpaces()
        character = expression.charCodeAt(index)
        if (character !== CLOSING_BRACKET_CODE) {
          throwError('Unclosed [')
        }
        index++
      } else if (character === OPENING_PARENTHESIS_CODE) {
        node = {
          type: CALL_EXPRESSION,
          'arguments': gobbleArguments(CLOSING_PARENTHESIS_CODE),
          callee: node
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

    const characters = expression.substring(index, index + 2)
    let operator = null
    if (characters === UPDATE_OPERATOR_DECREMENT) {
      operator = UPDATE_OPERATOR_DECREMENT
    } else if (characters === UPDATE_OPERATOR_INCREMENT) {
      operator = UPDATE_OPERATOR_INCREMENT
    } else {
      return
    }

    index += 2
    node = {
      type: UPDATE_EXPRESSION,
      operator: operator,
      argument: gobbleTokenProperty(gobbleIdentifier()),
      prefix: true,
    }
    if (!node.argument || (node.argument.type !== IDENTIFIER && node.argument.type !== MEMBER_EXPRESSION)) {
      this.throwError(`Unexpected ${env.node.operator}`);
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
      argument: node,
      prefix: false,
    }
    return node
  }

  const nodes = gobbleExpressions()
  return nodes.length === 1
    ? nodes[0]
    : {
      type: COMPOUND,
      body: nodes
    }
}

export default {
  parse: parse,
}
