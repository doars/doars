import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('store log context should execute function', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Create Doars with store.
  const doars = new Doars({
    root: window.document.body,
    storeContextInitial: { test: 'value' },
  })

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('logStore', function(store) {
    captured.logged = store.test
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}" d-initialized="logStore($store)"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert function was called and captured the specific value.
  expect(captured.logged).toBe('value')
})