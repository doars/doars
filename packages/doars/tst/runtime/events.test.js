import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from './test-setup.js'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

describe('Events', () => {
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

test('component updated event is dispatched', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}"></div>
  `

  // Create Doars.
  doars = new Doars({
    root: container,
  })

  let eventFired = false
  const div = container.querySelector('[d-state]')
  div.addEventListener('d-updated', () => {
    eventFired = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert event was fired.
  expect(eventFired).toBe(true)
})

test('component destroyed event is dispatched', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}"></div>
  `

  // Create Doars.
  doars = new Doars({
    root: container,
  })

  let eventFired = false
  const div = container.querySelector('[d-state]')
  div.addEventListener('d-destroyed', () => {
    eventFired = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Disable Doars.
  doars.disable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert event was fired.
  expect(eventFired).toBe(true)
})

test('library enabled event is dispatched', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}"></div>
  `

  // Create Doars.
  doars = new Doars({
    root: container,
  })

  let eventFired = false
  doars.addEventListener('enabled', () => {
    eventFired = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert event was fired.
  expect(eventFired).toBe(true)
})
})