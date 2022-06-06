import { createContexts } from './ContextUtils.js'
import {
  parse,
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
  contexts
) => {
  switch (node.type) {
    case COMPOUND:
      return node.body.map(node => reduce(node, contexts))

    case IDENTIFIER:
      return resolveIdentifier(node.name, contexts)

    case LITERAL:
      return node.value

    case PROPERTY:
      throw Error('Node type "' + node.type + '" not yet implemented')

    case ARRAY_EXPRESSION:
      return reduceArray(node, contexts)

    case ASSIGNMENT_EXPRESSION:
      throw Error('Node type "' + node.type + '" not yet implemented')

    case BINARY_EXPRESSION:
      return evalLeftSideRightSide(node, contexts)

    case CALL_EXPRESSION:
      return reduceCall(node, contexts)

    case CONDITIONAL_EXPRESSION:
      return reduceCondition(node, contexts)

    case MEMBER_EXPRESSION:
      return reduceMember(node, contexts)

    case OBJECT_EXPRESSION:
      throw Error('Node type "' + node.type + '" not yet implemented')

    case SEQUENCE_EXPRESSION:
      throw Error('Node type "' + node.type + '" not yet implemented')

    case UNARY_EXPRESSION:
      return reduceUnary(node, contexts)

    case UPDATE_EXPRESSION:
      throw Error('Node type "' + node.type + '" not yet implemented')
  }

  throw Error('Unexpected node type "' + node.type + '"')
}

const evalLeftSideRightSide = (
  node,
  contexts
) =>
  // TODO: Remove Function call.
  Function('lhs, rhs', `return lhs ${node.operator} rhs`)(
    reduce(node.left, contexts),
    reduce(node.right, contexts),
  )

const reduceArray = (
  node,
  contexts
) =>
  node.elements.map((element) => reduce(element, contexts))

const reduceCall = (
  node,
  contexts
) =>
  Reflect.apply(
    reduce(node.callee, contexts),
    null,
    node.arguments.map((argument) => reduce(argument, contexts)),
  )

const reduceCondition = (
  node,
  contexts
) =>
  // TODO: Remove Function call.
  Function('t, c, a', `return t ? c : a`)(
    reduce(node.test, contexts),
    reduce(node.consequent, contexts),
    reduce(node.alternate, contexts),
  )

const resolveIdentifier = (
  name,
  contexts
) => {
  if (contexts === void 0 || !(name in contexts)) {
    throw ReferenceError(`${name} is not defined`)
  }
  return Reflect.get(contexts, name, contexts)
}

const reduceMember = (
  node,
  contexts
) => {
  const value = reduce(node.object, contexts)
  const key =
    node.property.type === 'Identifier'
      ? node.property.name
      : reduce(node.property, contexts)

  if (typeof value[key] === 'function') {
    return value[key].bind(value)
  }
  return value[key]
}

const reduceUnary = (
  node,
  contexts
) => {
  if (!node.prefix || node.argument.type === 'UnaryExpression') {
    throw SyntaxError('Unexpected operator')
  }

  // TODO: Remove Function call.
  return Function('v', `return ${node.operator}v`)(reduce(node.argument, contexts))
}

export const interpret = (
  component,
  attribute,
  expression,
  extra = null,
  options = null
) => {
  // Collect update triggers.
  const triggers = []
  const update = (id, context) => {
    triggers.push({
      id: id,
      path: context,
    })
  }

  // Create function context.
  let { contexts, destroy } = createContexts(component, attribute, update, extra)

  // Try to execute code.
  let result
  try {
    result = reduce(parse(expression), contexts)
  } catch (error) {
    console.error(error, 'Error encountered when executing the following expression: ', expression)
    result = null
  }

  // Invoke destroy.
  destroy()

  // Dispatch update triggers.
  if (triggers.length > 0) {
    component.getLibrary().update(triggers)
  }

  return result
}

export default {
  interpret: interpret,
}
