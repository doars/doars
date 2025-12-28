import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('state log context should execute function', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('logState', function(state) {
    captured.logged = state.test
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ test: 'value' }" d-initialized="logState($state)"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert function was called and captured the specific value.
  expect(captured.logged).toBe('value')
})