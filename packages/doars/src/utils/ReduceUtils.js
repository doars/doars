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
      for (const element of node.elements) {
        arrayResults.push(reduce(element, context))
      }
      return arrayResults

    case ASSIGNMENT_EXPRESSION:
      // TODO:
      console.warn('node', node)
      console.warn('contexts', context)
      throw new Error('Node type "' + node.type + '" not yet implemented.')

    case BINARY_EXPRESSION:
      return Function('lhs, rhs', `return lhs ${node.operator} rhs`)(
        reduce(node.left, context),
        reduce(node.right, context),
      ) // TODO: Remove Function call.

    case CALL_EXPRESSION:
      const parameters = []
      for (const parameter of node.parameters) {
        parameters.push(reduce(parameter, context))
      }
      return reduce(node.callee, context)(...parameters)

    case CONDITIONAL_EXPRESSION:
      return Function('t, c, a', `return t ? c : a`)(
        reduce(node.test, context),
        reduce(node.consequent, context),
        reduce(node.alternate, context),
      ) // TODO: Remove Function call.

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
      for (const property of node.properties) {
        // Expects each property to be of type PROPERTY.
        objectResult[
          (property.computed || property.key.type !== IDENTIFIER) ? reduce(property.key, context) : property.key.name
        ] = reduce(property.value, context)
      }
      return objectResult

    case SEQUENCE_EXPRESSION:
      // TODO:
      console.warn('node', node)
      console.warn('contexts', context)
      throw new Error('Node type "' + node.type + '" not yet implemented.')

    case UNARY_EXPRESSION:
      if (!node.prefix || node.parameter.type === UNARY_EXPRESSION) {
        throw SyntaxError('Unexpected operator')
      }
      return Function('v', `return ${node.operator}v`)(
        reduce(node.parameter, context)
      ) // TODO: Remove Function call.

    case UPDATE_EXPRESSION:
      const updateResult = reduce(node.parameter, context)
      const updateValue = node.operator === '--' ? -1 : 1
      // TODO: Update in context by updateValue.
      return node.prefix ? updateResult + updateValue : updateResult
  }

  throw new Error('Unexpected node type "' + node.type + '".')
}

export default {
  reduce: reduce,
}
