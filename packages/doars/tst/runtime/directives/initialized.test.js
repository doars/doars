import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('initialized directive should run on component init', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ init: false }" d-initialized="$state.init = true">
      <span d-text="$state.init ? 'true' : 'false'"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initialized.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})

test('initialized directive should run on element init', async () => {
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
    <div d-state="{}">
      <div d-initialized="captured.initialized = true"></div>
    </div>
  `

  // Make captured available in the expression.
  global.captured = captured

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initialized.
  expect(captured.initialized).toBe(true)
})