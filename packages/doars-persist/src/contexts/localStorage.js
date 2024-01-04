import ProxyDispatcher from '@doars/common/src/events/ProxyDispatcher.js'
import createStateContext from '@doars/common/src/factories/createStateContext.js'

import { getAll } from '../utilities/localStorage.js'

export default ({
  localStorageContextDeconstruct,
  localStorageContextName,
}) => {
  // Setup proxy that updates to local storage.
  const proxy = new ProxyDispatcher()
  proxy.addEventListener('delete', (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join('.') + '".')
    }
    localStorage.removeItem(path[0])
  })
  proxy.addEventListener('set', (target, path) => {
    if (path.length > 1) {
      console.warn('Nested local storage impossible tried to set "' + path.join('.') + '".')
    }
    localStorage.setItem(path[0], target[path[0]])
  })

  return createStateContext(
    localStorageContextName,
    Symbol('ID_LOCAL_STORAGE'),
    proxy.add(getAll()),
    proxy,
    !!localStorageContextDeconstruct,
  )
}
