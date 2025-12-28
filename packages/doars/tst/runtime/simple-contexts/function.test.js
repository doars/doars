import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('simple context function can be called', async () => {
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
    <div d-state="">
      <button d-on:click="hello()"></button>
    </div>
  `

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  // Set simple context.
  doars.setSimpleContext('hello', () => {
    captured.called = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Click button.
  const button = window.document.querySelector('button')
  button.click()

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert function called.
  expect(captured.called).toBe(true)
})