import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Watch Context', () => {
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

test('watch immediate context should trigger immediately', async () => {
  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('setWatched', function() {
    captured.watched = true
  })

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ count: 0 }" d-initialized="$watch('count', () => setWatched(), { immediate: true })()"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert watch triggered immediately.
  expect(captured.watched).toBe(true)
})
})