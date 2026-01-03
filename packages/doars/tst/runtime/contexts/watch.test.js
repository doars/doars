import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Watch Context', () => {
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

  test('watch immediate context should trigger immediately', async () => {
    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Local state for the test.
    let captured = false

    // Set simple context with closure.
    doars.setSimpleContext('setWatched', function() {
      captured = true
    })

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ count: 0 }" d-initialized="$watch('count', () => setWatched())()"></div>
    `

    // Enable Doars.
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert watch triggered immediately.
    expect(captured).toBe(true)
  })
})
