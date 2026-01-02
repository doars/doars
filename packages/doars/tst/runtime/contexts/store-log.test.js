import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Store Log Context', () => {
  let container, doars

  beforeEach(() => {
    // Create a unique container for each test.
    container = document.createElement('div')
    container.id = 'test-container-' + Math.random().toString(36).substr(2, 9)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up after each test.
    doars = null
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
    container = null
  })

test('store log context should execute function', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}" d-initialized="logStore($store)"></div>
  `

  // Create Doars with store.
  doars = new Doars({
    root: container,
    storeContextInitial: { test: 'value' },
  })

  // Set simple context with closure.
  doars.setSimpleContext('logStore', function(store) {
    captured.logged = store.test
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert function was called and captured the specific value.
  expect(captured.logged).toBe('value')
})
})