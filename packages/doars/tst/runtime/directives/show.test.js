import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Show Directive', () => {
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

test('show directive should show element when true', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <div d-show="true" style="display: none;">
        Hello world!
      </div>
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
  const div = container.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should hide element when false', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <div d-show="false">
        Hello world!
      </div>
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
  const div = container.querySelector('div[d-show]')
  expect(div.style.display).toBe('none')
})

test('show directive should handle promises', async () => {
  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context for promise.
  doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <div d-show="resolveInTime(true)" style="display: none;">
        Hello world!
      </div>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert shown.
  const div = container.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should handle transitions on show', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <div d-show="true" style="display: none;" d-transition:in=".transition" d-transition:in.from=".opacity-0"
        d-transition:in.to=".opacity-1">
        Hello world!
      </div>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert shown.
  const div = container.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should handle transitions on hide', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <div d-show="false" d-transition:out=".transition" d-transition:out.from=".opacity-1"
        d-transition:out.to=".opacity-0">
        Hello world!
      </div>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert hidden.
  const div = container.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})
})