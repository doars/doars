// Import symbols.
import { SYNC_STORE } from '../../symbols.js'

// Import generator.
import createDirectiveSync from '@doars/doars/src/factories/directives/sync.js'

const STORE_PREFIX = '$store.'

export default function (id, store) {
  const directive = createDirectiveSync(SYNC_STORE, (component, attribute) => {
    // Remove prefix from value.
    let value = attribute.getValue()
    if (value.startsWith(STORE_PREFIX)) {
      value = value.substring(STORE_PREFIX.length)
    }

    // Return directive data.
    return {
      data: store,
      id: id,
      path: value,
    }
  }, STORE_PREFIX)

  directive.name = 'sync-store'

  return directive
}
