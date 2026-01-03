import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Sync Directive', () => {
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

test('sync directive should synchronize state and input', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ message: 'After' }">
      <input type="text" d-sync:state="message" value="Initial">

      <div d-text="message">Initial</div>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert initial sync.
  const input = container.querySelector('input')
  const div = container.querySelector('div[d-text]')
  expect(input.value).toBe('After')
  expect(div.textContent).toBe('After')
})

test('sync store directive should synchronize store and input', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <input type="text" d-sync:store="message" value="Initial">

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

  // Assert initial sync.
  const input = container.querySelector('input')
  const div = container.querySelector('div[d-text]')
  expect(input.value).toBe('Before')
  expect(div.textContent).toBe('Before')
})

test('sync state directive should synchronize state and textarea', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ message: 'After' }">
      <textarea d-sync:state="message">Initial</textarea>

      <div d-text="message">Initial</div>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert initial sync.
  const textarea = container.querySelector('textarea')
  const div = container.querySelector('div[d-text]')
  expect(textarea.value).toBe('After')
  expect(div.textContent).toBe('After')
})

test('sync state directive should synchronize state and checkboxes', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ selected: ['after'] }">
      <input type="checkbox" d-sync:state="selected" value="before" checked>
      <input type="checkbox" d-sync:state="selected" value="after">

      <div d-text="selected.join(', ')">Initial</div>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert initial sync.
  const checkboxes = container.querySelectorAll('input[type="checkbox"]')
  const div = container.querySelector('div[d-text]')
  expect(checkboxes[0].checked).toBe(false)
  expect(checkboxes[1].checked).toBe(true)
  expect(div.textContent).toBe('after')
})
})

