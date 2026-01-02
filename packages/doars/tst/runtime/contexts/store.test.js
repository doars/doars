import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Store Context', () => {
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

test('store context should share data across components', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <input type="text" d-on:input="$store.message = $event.target.value">
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
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert initial.
  const div = container.querySelector('div[d-text]')
  expect(div.textContent).toBe('Before')

  // Simulate input.
  const input = container.querySelector('input')
  input.value = 'After'
  input.dispatchEvent(new window.Event('input', { bubbles: true }))

  // Wait for update.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert updated.
  expect(div.textContent).toBe('After')
})
})