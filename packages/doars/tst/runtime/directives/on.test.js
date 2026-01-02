import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('On Directive', () => {
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

test('on click directive should handle click events', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <button d-on:click="setClicked()">
        Click
      </button>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context.
  doars.setSimpleContext('setClicked', () => {
    captured.clicked = true
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Simulate click.
  const button = container.querySelector('button')
  button.dispatchEvent(new window.Event('click', { bubbles: true }))

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert function called.
  expect(captured.clicked).toBe(true)
})

test('on click once directive should fire only once', async () => {
  // Local state for the test.
  const captured = { count: 0 }

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <button d-on:click.once="increment()">
        Click
      </button>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context.
  doars.setSimpleContext('increment', () => {
    captured.count++
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Click twice.
  const button = container.querySelector('button')
  button.dispatchEvent(new window.Event('click', { bubbles: true }))
  await new Promise(resolve => setTimeout(resolve, 100))
  button.dispatchEvent(new window.Event('click', { bubbles: true }))
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert clicked once.
  expect(captured.count).toBe(1)
})

test('on click outside directive handles outside clicks', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <button d-on:click.outside="setClicked()">
        Click
      </button>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context.
  doars.setSimpleContext('setClicked', () => {
    captured.clicked = true
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Click on container (outside button).
  container.dispatchEvent(new window.Event('click', { bubbles: true }))

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  expect(captured.clicked).toBe(true)
})

test('on keydown directive should handle key events', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <input type="text" d-on:keydown="setKey($event.key)">
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context.
  doars.setSimpleContext('setKey', (key) => {
    captured.key = key
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Simulate keydown.
  const input = container.querySelector('input')
  const event = new window.KeyboardEvent('keydown', { key: 'a' })
  input.dispatchEvent(event)

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert key set.
  expect(captured.key).toBe('a')
})

test('on keydown buffer custom directive should buffer events', async () => {
  // Local state for the test.
  const captured = { count: 0 }

  // Set the container HTML.
  container.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.buffer-5="capture()">
     </div>
   `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context for capturing.
  doars.setSimpleContext('capture', () => {
    captured.count++
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Focus input.
  const input = container.querySelector('input')
  input.focus()

  // Simulate keydowns.
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'c', bubbles: true }))
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'd', bubbles: true }))
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'e', bubbles: true }))

  // Wait for buffer.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert called once.
  expect(captured.count).toBe(1)
})

test('on keydown debounce custom directive should debounce events', async () => {
  // Local state for the test.
  const captured = { count: 0 }

  // Set the container HTML.
  container.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.debounce-50="capture()">
     </div>
   `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context for capturing.
  doars.setSimpleContext('capture', () => {
    captured.count++
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Focus input.
  const input = container.querySelector('input')
  input.focus()

  // Simulate keydowns.
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

  // Wait less than debounce.
  await new Promise(resolve => setTimeout(resolve, 10))

  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

  // Wait for debounce.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert called once.
  expect(captured.count).toBe(1)
})

test('on keydown debounce directive should debounce events', async () => {
  // Local state for the test.
  const captured = { count: 0 }

  // Set the container HTML.
  container.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.debounce="capture()">
     </div>
   `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context for capturing.
  doars.setSimpleContext('capture', () => {
    captured.count++
  })

  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Focus input.
  const input = container.querySelector('input')
  input.focus()

  // Simulate keydowns.
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

  // Wait less than default debounce (300ms).
  await new Promise(resolve => setTimeout(resolve, 200))

  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

  // Wait for debounce.
  await new Promise(resolve => setTimeout(resolve, 500))

  // Assert called once.
  expect(captured.count).toBe(1)
})

test('on keydown throttle directive should throttle events', async () => {
  // Local state for the test.
  const captured = { count: 0 }

  // Set the container HTML.
  container.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.throttle="capture()">
     </div>
   `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  // Set simple context for capturing.
  doars.setSimpleContext('capture', () => {
    captured.count++
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Focus input.
  const input = container.querySelector('input')
  input.focus()

  // Simulate keydowns.
  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

  // Wait less than throttle (300ms).
  await new Promise(resolve => setTimeout(resolve, 200))

  input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

  // Wait for throttle.
  await new Promise(resolve => setTimeout(resolve, 320))

  // Assert called once (throttled).
  expect(captured.count).toBe(1)
})
})
