// Import symbols.
import { SYNC_STATE } from '../symbols.js'

// Import generator.
import createDirectiveSync from '../factories/directives/sync.js'

const STATE_PREFIX = '$state.'

const directive = createDirectiveSync(SYNC_STATE, (component, attribute) => {
  // Add prefix to value.
  let value = attribute.getValue()
  if (!value.startsWith(STATE_PREFIX)) {
    value = STATE_PREFIX + value
  }

  // Return directive data.
  return {
    data: component.getState(),
    id: component.getId(),
    path: value,
  }
}, STATE_PREFIX)

directive.name = 'sync-state'

export default directive
