import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Function State Simple Context', () => {
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

test('simple context function initializes state', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="createState()" d-initialized="setMessage($state.message)"></div>
  `

  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple contexts.
  doars.setSimpleContext('createState', () => {
    return {
      message: 'Hello there!'
    }
  })
  doars.setSimpleContext('setMessage', (message) => {
    captured.message = message
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert state initialized.
  expect(captured.message).toBe('Hello there!')
})
})