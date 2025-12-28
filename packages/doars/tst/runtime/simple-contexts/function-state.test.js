import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('simple context function initializes state', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="createState()">
      <span d-text="message"></span>
    </div>
  `

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  // Set simple context.
  doars.setSimpleContext('createState', () => {
    return {
      message: 'Hello there!'
    }
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert state initialized.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('Hello there!')
})