import { createContexts } from './ContextUtils.js'

export const reduce = (node, contexts) => {
  switch (node.type) {
    case 'ArrayExpression':
      return reduceArray(node, contexts)

    case 'BinaryExpression':
      return evalLeftSideRightSide(node, contexts)

    case 'CallExpression':
      return reduceCall(node, contexts)

    case 'ConditionalExpression':
      return reduceCondition(node, contexts)

    case 'ExpressionStatement':
      return reduce(node.expression, contexts)

    case 'Identifier':
      return resolveIdentifier(node.name, contexts)

    case 'Literal':
      return node.value

    case 'LogicalExpression':
      return evalLeftSideRightSide(node, contexts)

    case 'MemberExpression':
      return reduceMember(node, contexts)


    case 'ThisExpression':
      return contexts

    case 'UnaryExpression':
      return reduceUnary(node, contexts)
  }

  throw SyntaxError('Unexpected node')
}

const evalLeftSideRightSide = (node, contexts) =>
  // TODO: Remove Function call.
  Function('lhs, rhs', `return lhs ${node.operator} rhs`)(
    reduce(node.left, contexts),
    reduce(node.right, contexts),
  )

const reduceArray = (node, contexts) =>
  node.elements.map((element) => reduce(element, contexts))

const reduceCall = (node, contexts) =>
  Reflect.apply(
    reduce(node.callee, contexts),
    null,
    node.arguments.map((argument) => reduce(argument, contexts)),
  )

const reduceCondition = (node, contexts) =>
  // TODO: Remove Function call.
  Function('t, c, a', `return t ? c : a`)(
    reduce(node.test, contexts),
    reduce(node.consequent, contexts),
    reduce(node.alternate, contexts),
  )

const resolveIdentifier = (name, contexts) => {
  if (contexts === void 0 || !(name in contexts)) {
    throw ReferenceError(`${name} is not defined`)
  }
  return Reflect.get(contexts, name, contexts)
}

const reduceMember = (node, contexts) => {
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

const reduceUnary = (node, contexts) => {
  if (!node.prefix || node.argument.type === 'UnaryExpression') {
    throw SyntaxError('Unexpected operator')
  }

  // TODO: Remove Function call.
  return Function('v', `return ${node.operator}v`)(reduce(node.argument, contexts))
}

export const evaluate = (component, attribute, expression, extra = null, options = null) => {
  // Collect update triggers.
  const triggers = []
  const update = (id, context) => {
    triggers.push({
      id: id,
      path: context,
    })
  }

  // Create function context.
  let { contexts, deconstructed, destroy } = createContexts(component, attribute, update, extra)

  // Try to execute code.
  let result
  try {
    const contextDeconstructed = contexts // TODO: Assign deconstructed as well.
    result = reduce(expression, contextDeconstructed)
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
  evaluate: evaluate,
}
