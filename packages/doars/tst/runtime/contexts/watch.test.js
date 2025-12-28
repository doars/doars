import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('watch immediate context should trigger immediately', async () => {
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
  doars.setSimpleContext('setWatched', function() {
    captured.watched = true
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ count: 0 }" d-initialized="$watch('count', () => setWatched(), { immediate: true })()"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

   // Assert watch triggered immediately.
   expect(captured.watched).toBe(true)
})