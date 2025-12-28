import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars variants
import DoarsCall from '../../src/DoarsCall.js'
import DoarsExecute from '../../src/DoarsExecute.js'
import DoarsInterpret from '../../src/DoarsInterpret.js'

test('call processor allows calling functions without parentheses', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Local state for the test.
  const captured = {}

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state d-initialized="set_called"></div>
  `

  // Create Doars with call processor.
  const doars = new DoarsCall({
    root: window.document.body,
    processor: 'call',
  })

  // Set simple context.
  doars.setSimpleContext('set_called', () => {
    captured.called = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert function called.
  expect(captured.called).toBe(true)
})

test('execute processor executes JavaScript code', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Local state for the test.
  const captured = {}

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state d-initialized="captured.executed = true"></div>
  `

  // Create Doars with execute processor.
  const doars = new DoarsExecute({
    root: window.document.body,
  })

  // Make captured available in the expression.
  global.captured = captured

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert code executed.
  expect(captured.executed).toBe(true)
})

test('interpret processor interprets expressions with simple contexts', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Local state for the test.
  const captured = {}

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state d-initialized="test.log('initialized')"></div>
  `

  // Create Doars with interpret processor.
  const doars = new DoarsInterpret({
    root: window.document.body,
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
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert expression interpreted.
  expect(captured.message).toBe('initialized')
})