import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from './test-setup.js'

// Import Doars variants
import DoarsCall from '../../src/DoarsCall.js'
import DoarsExecute from '../../src/DoarsExecute.js'
import DoarsInterpret from '../../src/DoarsInterpret.js'

describe('Processors', () => {
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

test('call processor allows calling functions without parentheses', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state d-initialized="set_called"></div>
  `

  // Create Doars with call processor.
  doars = new DoarsCall({
    root: container,
    processor: 'call',
  })

  // Set simple context.
  doars.setSimpleContext('set_called', () => {
    captured.called = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert function called.
  expect(captured.called).toBe(true)
})

test('execute processor executes JavaScript code', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state d-initialized="captured.executed = true"></div>
  `

  // Create Doars with execute processor.
  doars = new DoarsExecute({
    root: container,
  })

  // Make captured available in the expression.
  global.captured = captured

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert code executed.
  expect(captured.executed).toBe(true)
})

test('interpret processor interprets expressions with simple contexts', async () => {
  // Local state for the test.
  const captured = {}

  // Set the container HTML.
  container.innerHTML = `
    <div d-state d-initialized="test.log('initialized')"></div>
  `

  // Create Doars with interpret processor.
  doars = new DoarsInterpret({
    root: container,
  })

  // Set simple context.
  doars.setSimpleContext('test', {
    log: (message) => {
      captured.message = message
    }
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert expression interpreted.
  expect(captured.message).toBe('initialized')
})
})