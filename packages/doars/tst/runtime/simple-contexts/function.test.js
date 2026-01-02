import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Function Simple Context', () => {
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

test('simple context function can be called', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="">
      <button d-on:click="hello()"></button>
    </div>
  `

  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context.
  doars.setSimpleContext('hello', () => {
    captured.called = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Click button.
  const button = container.querySelector('button')
  button.click()

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert function called.
  expect(captured.called).toBe(true)
})
})