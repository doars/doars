// Based on Eric Smekens's jsep, v1.3.6, https://github.com/EricSmekens/jsep#readme).

const COMPOUND = 'Compound'
const SEQUENCE_EXP = 'SequenceExpression'
const IDENTIFIER = 'Identifier'
const MEMBER_EXP = 'MemberExpression'
const LITERAL = 'Literal'
const THIS_EXP = 'ThisExpression'
const CALL_EXP = 'CallExpression'
const UNARY_EXP = 'UnaryExpression'
const BINARY_EXP = 'BinaryExpression'
const ARRAY_EXP = 'ArrayExpression'

const TAB_CODE = 9
const LF_CODE = 10
const CR_CODE = 13
const SPACE_CODE = 32
const DOUBLE_QUOTE_CODE = 34 // "
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
const LOWERCASE_A_CODE = 97 // a
const LOWERCASE_Z_CODE = 122 // z

const BINARY_OPERATORS = {
  '||': 1,
  '&&': 2,
  // '|': 3,
  // '^': 4,
  // '&': 5,
  '==': 6,
  '!=': 6,
  '===': 6,
  '!==': 6,
  '<': 7,
  '>': 7,
  '<=': 7,
  '>=': 7,
  // '<<': 8,
  // '>>': 8,
  // '>>>': 8,
  '+': 9,
  '-': 9,
  '*': 10,
  '/': 10,
  '%': 10,
}
const MAX_BINARY_OPERATOR_LENGTH = 3
const UNARY_OPERATORS = {
  '-': 1,
  '!': 1,
  // '~': 1,
  '+': 1,
}
const MAX_UNARY_OPERATOR_LENGTH = 1

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
  (character >= UPPERCASE_A_CODE && character <= UPPERCASE_Z_CODE) ||
  (character >= LOWERCASE_A_CODE && character <= LOWERCASE_Z_CODE) ||
  (character >= 128 && !BINARY_OPERATORS[String.fromCharCode(character)])

const isIdentifierPart = (character) =>
  isIdentifierStart(character) || isDecimalDigit(character)

// export
const parse = (expression) => {
  let index = 0

  const throwError = (message) => {
    const error = new Error(message + ' at character ' + index)
    error.index = index
    error.description = message
    throw error
  }

  const getCharacter = () => expression.charAt(index)
  const getCode = () => expression.charCodeAt(index)

  const gobbleArray = () => {
    index++

    return {
      type: ARRAY_EXP,
      elements: gobbleArguments(CLOSING_BRACKET_CODE)
    }
  }

  const gobbleArguments = (termination) => {
    const parameters = []
    let closed = false
    let separatorCount = 0

    while (index < expression.length) {
      gobbleSpaces()
      let characterIndex = getCode()

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
            for (let arg = parameters.length; arg < separatorCount; arg++) {
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
    let node, binaryOperation, precedence, stack, binaryOperationInfo, left, right, i, currentBinaryOperation

    left = gobbleToken()
    console.log('left', left) // TODO:
    if (!left) {
      return left
    }

    binaryOperation = gobbleBinaryOperation()
    console.log('binaryOperation', binaryOperation) // TODO:
    if (!binaryOperation) {
      return left
    }

    binaryOperationInfo = {
      value: binaryOperation,
      precedence: binaryPrecedence(binaryOperation),
    }

    right = gobbleToken()
    console.log('right', right) // TODO:
    if (!right) {
      throwError('Expected expression after ' + binaryOperation)
    }

    stack = [
      left,
      binaryOperationInfo,
      right,
    ]
    console.log('stack', stack) // TODO:

    while ((binaryOperation = gobbleBinaryOperation())) {
      precedence = binaryPrecedence(binaryOperation)

      if (precedence === 0) {
        index -= binaryOperation.length
        break
      }

      binaryOperationInfo = {
        value: binaryOperation,
        precedence: precedence,
      }

      currentBinaryOperation = binaryOperation

      const comparePrevious = prev => precedence <= prev.precedence
      while ((stack.length > 2) && comparePrevious(stack[stack.length - 2])) {
        right = stack.pop()
        binaryOperation = stack.pop().value
        left = stack.pop()
        node = {
          type: BINARY_EXP,
          operator: binaryOperation,
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
      node = {
        type: BINARY_EXP,
        operator: stack[i - 1].value,
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
        !isIdentifierStart(getCode()) ||
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
    const node = gobbleBinaryExpression()
    gobbleSpaces()
    return node
  }

  const gobbleExpressions = () => {
    let nodes = [], characterIndex, node

    while (index < expression.length) {
      characterIndex = getCode()

      if (characterIndex === SEMICOLON_CODE || characterIndex === COMMA_CODE) {
        index++
      } else {
        node = gobbleExpression()
        if (node) {
          nodes.push(node)
        } else if (index < expression.length) {
          if (characterIndex === undefined) {
            break
          }
          throwError('Unexpected "' + getCharacter() + '"')
        }
      }
    }

    return nodes
  }

  const gobbleGroup = () => {
    index++
    let nodes = gobbleExpressions(CLOSING_PARENTHESIS_CODE)
    if (getCode() === CLOSING_PARENTHESIS_CODE) {
      index++
      if (nodes.length === 1) {
        return nodes[0]
      } else if (!nodes.length) {
        return false
      }
      return {
        type: SEQUENCE_EXP,
        expressions: nodes,
      }
    }
    throwError('Unclosed (')
  }

  const gobbleIdentifier = () => {
    let character = getCode(), start = index

    if (isIdentifierStart(character)) {
      index++
    } else {
      throwError('Unexpected ' + getCharacter())
    }

    while (index < expression.length) {
      character = getCode()

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

    while (isDecimalDigit(getCode())) {
      number += expression.charAt(index++)
    }

    if (getCode() === PERIOD_CODE) {
      number += expression.charAt(index++)

      while (isDecimalDigit(getCode())) {
        number += expression.charAt(index++)
      }
    }

    character = getCharacter()

    if (character === 'e' || character === 'E') {
      number += expression.charAt(index++)
      character = getCharacter()

      if (character === '+' || character === '-') {
        number += expression.charAt(index++)
      }

      while (isDecimalDigit(getCode())) {
        number += expression.charAt(index++)
      }

      if (!isDecimalDigit(expression.charCodeAt(index - 1))) {
        throwError('Expected exponent (' + number + getCharacter() + ')')
      }
    }

    characterCode = getCode()

    if (isIdentifierStart(characterCode)) {
      throwError('Variable names cannot start with a number (' + number + getCharacter() + ')')
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

  const gobbleSpaces = () => {
    let character = getCode()
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

  const gobbleToken = () => {
    let character, toCheck, toCheckLength, node

    gobbleSpaces()

    character = getCode()

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
        if (UNARY_OPERATORS.hasOwnProperty(toCheck) && (
          !isIdentifierStart(getCode()) ||
          (index + toCheck.length < expression.length && !isIdentifierPart(expression.charCodeAt(index + toCheck.length)))
        )) {
          index += toCheckLength
          const argument = gobbleToken()
          if (!argument) {
            throwError('missing unaryOp argument')
          }
          return {
            type: UNARY_EXP,
            operator: to_check,
            argument,
            prefix: true,
          }
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
        } else if (node.name === 'this') {
          node = {
            type: THIS_EXP,
          }
        }
      } else if (character === OPENING_PARENTHESIS_CODE) {
        node = gobbleGroup()
      }
    }

    return gobbleTokenProperty(node)
  }

  const gobbleTokenProperty = (node) => {
    gobbleSpaces()

    let character = getCode()
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
        character = getCode()
      }
      index++

      if (character === OPENING_BRACKET_CODE) {
        node = {
          type: MEMBER_EXP,
          computed: true,
          object: node,
          property: gobbleExpression()
        }
        gobbleSpaces()
        character = getCode()
        if (character !== CLOSING_BRACKET_CODE) {
          throwError('Unclosed [')
        }
        index++
      } else if (character === OPENING_PARENTHESIS_CODE) {
        node = {
          type: CALL_EXP,
          'arguments': gobbleArguments(CLOSING_PARENTHESIS_CODE),
          callee: node
        }
      } else if (character === PERIOD_CODE || optional) {
        if (optional) {
          index--
        }
        gobbleSpaces()
        node = {
          type: MEMBER_EXP,
          computed: false,
          object: node,
          property: gobbleIdentifier(),
        }
      }

      if (optional) {
        node.optional = true
      }

      gobbleSpaces()
      character = getCode()
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

[
  // 'hello ? what : other',
  'what == some',
].forEach(expression => console.log(parse(expression)))

// export default {
//   parse: parse,
// }
