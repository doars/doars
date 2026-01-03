import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('State Directive', () => {
  let container, doars

  beforeEach(() => {
    // Create a unique container for each test.
    container = document.createElement('div')
    container.id = 'test-container-' + Math.random().toString(36).substr(2, 9)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up after each test.
    if (doars) {
      doars.disable()
      doars = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
  })

test('state directive should initialize and assign values', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ message: 'Hello there!' }" d-initialized="$state.message = 'General Kenobi.'">
      <span d-text="message"></span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert assigned.
  const span = container.querySelector('span')
  expect(span.textContent).toBe('General Kenobi.')
})

test('state directive should handle empty state', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="" d-initialized="$state.test = true">
      <span d-text="$state.test ? 'true' : 'false'"></span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert empty state works.
  const span = container.querySelector('span')
  expect(span.textContent).toBe('true')
})

test('state directive should handle Object.assign', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ message: 'Hello there!' }" d-initialized="Object.assign($state, { message: 'General Kenobi.' })">
      <span d-text="message"></span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert assigned.
  const span = container.querySelector('span')
  expect(span.textContent).toBe('General Kenobi.')
})
})