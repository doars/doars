import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('State Log Context', () => {
  let container, doars

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    doars.disable()
    doars = null
    document.body.removeChild(container)
    container = null
  })

  test('state log context should execute function', async () => {
    // Local state for the test.
    let captured = null

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ message: 'value' }" d-initialized="logState($state)"></div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context with closure.
    doars.setSimpleContext('logState', function(state) {
      captured = state.message
    })

    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert function was called and captured the specific value.
    expect(captured).toBe('value')
  })
})
