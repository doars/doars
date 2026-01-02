import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('NextTick Context', () => {
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

test('nextTick context should defer execution', async () => {
  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('setTicked', function() {
    captured.ticked = true
  })

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}" d-initialized="$nextTick(() => setTicked())"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert nextTick executed.
  expect(captured.ticked).toBe(true)
})
})