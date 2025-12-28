import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('store context should share data across components', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <input type="text" d-on:input="$store.message = $event.target.value">
      <div d-text="$store.message">Initial</div>
    </div>
  `

  // Create and enable Doars with initial store.
  const doars = new Doars({
    root: window.document.body,
    storeContextInitial: {
      message: 'Before',
    },
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial.
  const div = window.document.querySelector('div[d-text]')
  expect(div.textContent).toBe('Before')

  // Simulate input.
  const input = window.document.querySelector('input')
  input.value = 'After'
  input.dispatchEvent(new window.Event('input', { bubbles: true }))

  // Wait for update.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert updated.
  expect(div.textContent).toBe('After')
})