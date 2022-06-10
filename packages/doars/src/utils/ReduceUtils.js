import {
  COMPOUND,
  IDENTIFIER,
  LITERAL,
  PROPERTY,
  ARRAY_EXPRESSION,
  ASSIGNMENT_EXPRESSION,
  BINARY_EXPRESSION,
  CALL_EXPRESSION,
  CONDITIONAL_EXPRESSION,
  MEMBER_EXPRESSION,
  OBJECT_EXPRESSION,
  SEQUENCE_EXPRESSION,
  UNARY_EXPRESSION,
  UPDATE_EXPRESSION
} from './ParseUtils.js'

const setToContext = (
  node,
  value,
  context = {}
) => {
  switch (node.type) {
    case IDENTIFIER:
      return context[node.name] = value

    case MEMBER_EXPRESSION:
      console.warn('node', node)
      console.warn('contexts', context)
      // TODO:
      return value
  }

  throw new Error('Unsupported assignment method.')
}

export const reduce = (
  node,
  context = {}
) => {
  switch (node.type) {
    case COMPOUND:
      return node.body.map(node => reduce(node, context))

    case IDENTIFIER:
      return context[node.name]

    case LITERAL:
      return node.value

    case ARRAY_EXPRESSION:
      const arrayResults = []
      for (const arrayElement of node.elements) {
        arrayResults.push(reduce(arrayElement, context))
      }
      return arrayResults

    case ASSIGNMENT_EXPRESSION:
      let assignmentValue = reduce(node.right, context)
      // Modify value if not a direct assignment.
      if (node.operator !== '=') {
        const assignmentLeft = reduce(node.left, context)
        switch (node.operator) {
          case '*=':
            assignmentValue = assignmentLeft * assignmentValue
            break
          case '**=':
            assignmentValue = assignmentLeft ** assignmentValue
            break
          case '/=':
            assignmentValue = assignmentLeft / assignmentValue
            break
          case '%=':
            assignmentValue = assignmentLeft % assignmentValue
            break
          case '+=':
            assignmentValue = assignmentLeft + assignmentValue
            break
          case '-=':
            assignmentValue = assignmentLeft - assignmentValue
            break
        }
      }
      return setToContext(node.left, assignmentValue, context)

    case BINARY_EXPRESSION:
      const binaryLeft = reduce(node.left, context)
      const binaryRight = reduce(node.right, context)
      switch (node.operator) {
        case '||':
          return binaryLeft || binaryRight
        case '&&':
          return binaryLeft && binaryRight
        case '==':
          return binaryLeft == binaryRight
        case '!=':
          return binaryLeft != binaryRight
        case '===':
          return binaryLeft === binaryRight
        case '!==':
          return binaryLeft !== binaryRight
        case '<':
          return binaryLeft < binaryRight
        case '>':
          return binaryLeft > binaryRight
        case '<=':
          return binaryLeft <= binaryRight
        case '>=':
          return binaryLeft >= binaryRight
        case '-':
          return binaryLeft - binaryRight
        case '+':
          return binaryLeft + binaryRight
        case '*':
          return binaryLeft * binaryRight
        case '/':
          return binaryLeft / binaryRight
        case '%':
          return binaryLeft % binaryRight
      }
      throw new Error('Unsupported operator: ' + node.operator)

    case CALL_EXPRESSION:
      const parameters = []
      for (const parameter of node.parameters) {
        parameters.push(reduce(parameter, context))
      }
      return reduce(node.callee, context)(...parameters)

    case CONDITIONAL_EXPRESSION:
      return reduce(node.condition, context)
        ? reduce(node.consequent, context)
        : reduce(node.alternate, context)

    case MEMBER_EXPRESSION:
      const memberKey =
        node.property.type === IDENTIFIER
          ? node.property.name
          : reduce(node.property, context)
      const memberValue = reduce(node.object, context)
      if (typeof (memberValue[memberKey]) === 'function') {
        return memberValue[memberKey].bind(memberValue)
      }
      return memberValue[memberKey]

    case OBJECT_EXPRESSION:
      const objectResult = {}
      for (const objectProperty of node.properties) {
        // Expects each property to be of type PROPERTY.
        objectResult[
          (objectProperty.computed || objectProperty.key.type !== IDENTIFIER) ? reduce(objectProperty.key, context) : objectProperty.key.name
        ] = reduce(objectProperty.value, context)
      }
      return objectResult

    case SEQUENCE_EXPRESSION:
      return node.expressions.map(node => reduce(node, context))

    case UNARY_EXPRESSION:
      const unaryParameter = reduce(node.parameter, context)
      switch (node.operator) {
        case '!':
          return !unaryParameter
        case '-':
          return - unaryParameter
        case '+':
          return + unaryParameter
      }
      throw new Error('Unsupported operator: ' + node.operator)

    case UPDATE_EXPRESSION:
      const updateResult = reduce(node.parameter, context)
      const updateValue = node.operator === '--' ? -1 : 1
      setToContext(node.left, updateResult + updateValue, context)
      return node.prefix ? updateResult + updateValue : updateResult
  }

  throw new Error('Unexpected node type "' + node.type + '".')
}

export default {
  reduce: reduce,
}
