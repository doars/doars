import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Store Context', () => {
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

  test('store context should share data inside components', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}" d-initialized="$store.message = 'After'"></div>
      <div d-state="{}">
        <div d-text="$store.message">Initial</div>
      </div>
    `

    // Create and enable Doars with initial store.
    doars = new Doars({
      root: container,
      storeContextInitial: {
        message: 'Before',
      },
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert
    const div = container.querySelector('div[d-text]')
    expect(div.textContent).toBe('After')
  })

  test('store log context should execute function', async () => {
    // Local state for the test.
    let captured = null

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}" d-initialized="logStore($store)"></div>
    `

    // Create Doars with store.
    doars = new Doars({
      root: container,
      storeContextInitial: {
        message: 'value',
      },
    })

    // Set simple context with closure.
    doars.setSimpleContext('logStore', function(store) {
      captured = store.message
    })

    // Enable Doars.
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert function was called and captured the specific value.
    expect(captured).toBe('value')
  })
})
