import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('References Context', () => {
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

test('references context should provide referenced elements', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ refCount: '0' }" d-initialized="$state.refCount = Object.keys($references).length.toString()">
      <span d-text="$state.refCount"></span>
      <input d-reference="'myInput'">
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const span = container.querySelector('span')
  expect(span.textContent).toBe('1')
})
})