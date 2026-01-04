import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('On Directive', () => {
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
    await new Promise(resolve => setTimeout(resolve, 1))

    // Simulate click.
    const button = container.querySelector('button')
    button.dispatchEvent(new window.Event('click', { bubbles: true }))

    // Wait for event.
    await new Promise(resolve => setTimeout(resolve, 1))

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
    await new Promise(resolve => setTimeout(resolve, 1))

    // Click twice.
    const button = container.querySelector('button')
    button.dispatchEvent(new window.Event('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 1))
    button.dispatchEvent(new window.Event('click', { bubbles: true }))
    await new Promise(resolve => setTimeout(resolve, 1))

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
    await new Promise(resolve => setTimeout(resolve, 1))

    // Click on container (outside button).
    container.dispatchEvent(new window.Event('click', { bubbles: true }))

    // Wait for event.
    await new Promise(resolve => setTimeout(resolve, 1))

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
    await new Promise(resolve => setTimeout(resolve, 1))

    // Simulate keydown.
    const input = container.querySelector('input')
    const event = new window.KeyboardEvent('keydown', { key: 'a' })
    input.dispatchEvent(event)

    // Wait for event.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert key set.
    expect(captured.key).toBe('a')
  })

  test('on keydown buffer directive should buffer events (default: 5)', async () => {
    // Local state for the test.
    const captured = { count: 0 }

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <input type="text" d-on:keydown.buffer="capture()">
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

    await new Promise(resolve => setTimeout(resolve, 1))

    const input = container.querySelector('input')
    input.focus()

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'c', bubbles: true }))
    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'd', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 1))

    expect(captured.count).toBe(0)

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'e', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 1))

    expect(captured.count).toBe(1)
  })

  test('on keydown debounce directive should debounce events (default: 500ms)', async () => {
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

    await new Promise(resolve => setTimeout(resolve, 1))

    const input = container.querySelector('input')
    input.focus()

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 300))

    expect(captured.count).toBe(0)

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 600))

    expect(captured.count).toBe(1)
  })

  test('on keydown debounce directive should debounce events (custom: 10ms)', async () => {
    // Local state for the test.
    const captured = { count: 0 }

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <input type="text" d-on:keydown.debounce-10="capture()">
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

    await new Promise(resolve => setTimeout(resolve, 1))

    const input = container.querySelector('input')
    input.focus()

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 5))

    expect(captured.count).toBe(0)

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 20))

    expect(captured.count).toBe(1)
  })

  test('on keydown throttle directive should throttle events (default: 500ms)', async () => {
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

    await new Promise(resolve => setTimeout(resolve, 1))

    const input = container.querySelector('input')
    input.focus()

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 300))

    expect(captured.count).toBe(1)

    input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

    await new Promise(resolve => setTimeout(resolve, 300))

    expect(captured.count).toBe(1)
  })
})
