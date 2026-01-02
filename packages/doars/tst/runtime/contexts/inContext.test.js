import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('InContext Context', () => {
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

test('inContext should execute function in component context', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ message: 'General Kenobi.', logged: '' }" d-initialized="$inContext(({ $state }) => { $state.logged = $state.message })">
      <span d-text="$state.logged"></span>
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
  expect(span.textContent).toBe('General Kenobi.')
})
})