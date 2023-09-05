import createStateContext from '@doars/common/src/factories/createStateContext.js'

export default (
  id,
  state,
  proxy,
  deconstruct,
) => createStateContext(
  '$localStorage',
  id,
  state,
  proxy,
  deconstruct,
)
