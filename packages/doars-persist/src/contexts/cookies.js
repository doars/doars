import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'
import createStateContext from '@doars/common/src/factories/createStateContext.js'

import {
  getAll,
  set,
} from '../utilities/cookies.js'

export default ({
  cookiesContextDeconstruct,
  cookiesContextName,
}) => {
  // Setup proxy that updates to cookies.
  const proxy = new ProxyDispatcher()
  const onMutate = (target, path) => {
    if (path.length > 1) {
      console.warn('Nested cookies impossible tried to set "' + path.join('.') + '".')
    }
    set(path[0], target[path[0]])
  }
  proxy.addEventListener('delete', onMutate)
  proxy.addEventListener('set', onMutate)

  return createStateContext(
    cookiesContextName,
    Symbol('ID_COOKIES'),
    proxy.add(getAll()),
    proxy,
    !!cookiesContextDeconstruct,
  )
}
