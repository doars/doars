import {
  COMPOUND,
  IDENTIFIER,
  LITERAL,
  PROPERTY,

  ARRAY,
  ASSIGN,
  BINARY,
  CALL,
  CONDITION,
  MEMBER,
  OBJECT,
  SEQUENCE,
  UNARY,
  UPDATE,
} from './types.js'

const setToContext = (
  node,
  value,
  context = {}
) => {
  switch (node.type) {
    case IDENTIFIER:
      // Assign to
      return context[node.name] = value

    case MEMBER:
      const memberObject = run(node.object, context)
      const memberProperty =
        node.computed || node.property.type !== IDENTIFIER
          ? run(node.property, context)
          : node.property.name
      if (typeof (value) === 'function') {
        return value.bind(memberObject)
      }
      return memberObject[memberProperty] = value
  }

  throw new Error('Unsupported assignment method.')
}

const run = (
  node,
  context = {}
) => {
  if (!node) {
    return
  }

  switch (node.type) {
    case COMPOUND:
      return node.body.map(node => run(node, context))

    case IDENTIFIER:
      return context[node.name]

    case LITERAL:
      return node.value

    case ARRAY:
      const arrayResults = []
      for (const arrayElement of node.elements) {
        arrayResults.push(run(arrayElement, context))
      }
      return arrayResults

    case ASSIGN:
      let assignmentValue = run(node.right, context)
      // Modify value if not a direct assignment.
      if (node.operator !== '=') {
        const assignmentLeft = run(node.left, context)
        switch (node.operator) {
          case '||=':
            if (assignmentLeft) {
              return assignmentLeft
            }
            break
          case '&&=':
            if (!assignmentLeft) {
              return assignmentLeft
            }
            break
          case '??=':
            if (assignmentLeft !== null && assignmentLeft !== undefined) {
              return assignmentLeft
            }
            break
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

    case BINARY:
      const binaryLeft = run(node.left, context)
      const binaryRight = run(node.right, context)
      switch (node.operator) {
        case '||':
          return binaryLeft || binaryRight
        case '&&':
          return binaryLeft && binaryRight
        case '??':
          return binaryLeft ?? binaryRight
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

    case CALL:
      const parameters = []
      for (const parameter of node.parameters) {
        parameters.push(run(parameter, context))
      }
      return run(node.callee, context)(...parameters)

    case CONDITION:
      return run(node.condition, context)
        ? run(node.consequent, context)
        : run(node.alternate, context)

    case MEMBER:
      const memberObject = run(node.object, context)
      const memberProperty =
        node.computed || node.property.type !== IDENTIFIER
          ? run(node.property, context)
          : node.property.name
      if (typeof (memberObject[memberProperty]) === 'function') {
        return memberObject[memberProperty].bind(memberObject)
      }
      return memberObject[memberProperty]

    case OBJECT:
      const objectResult = {}
      for (const objectProperty of node.properties) {
        // Expects each property to be of type PROPERTY.
        objectResult[
          (objectProperty.computed || objectProperty.key.type !== IDENTIFIER) ? run(objectProperty.key, context) : objectProperty.key.name
        ] = run(objectProperty.value, context)
      }
      return objectResult

    case SEQUENCE:
      return node.expressions.map(node => run(node, context))

    case UNARY:
      const unaryParameter = run(node.parameter, context)
      switch (node.operator) {
        case '!':
          return !unaryParameter
        case '-':
          return - unaryParameter
        case '+':
          return + unaryParameter
      }
      throw new Error('Unsupported operator: ' + node.operator)

    case UPDATE:
      const updateResult = run(node.parameter, context)
      const updateValue = node.operator === '--' ? -1 : 1
      setToContext(node.left, updateResult + updateValue, context)
      return node.prefix ? updateResult + updateValue : updateResult
  }

  throw new Error('Unexpected node type "' + node.type + '".')
}
export default run
