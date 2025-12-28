import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('sync directive should synchronize state and input', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'After' }">
      <input type="text" d-sync:state="message" value="Initial">

      <div d-text="message">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const input = window.document.querySelector('input')
  const div = window.document.querySelector('div[d-text]')
  expect(input.value).toBe('After')
  expect(div.textContent).toBe('After')
})

test('sync store directive should synchronize store and input', async () => {
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
      <input type="text" d-sync:store="message" value="Initial">

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

  // Assert initial sync.
  const input = window.document.querySelector('input')
  const div = window.document.querySelector('div[d-text]')
  expect(input.value).toBe('Before')
  expect(div.textContent).toBe('Before')
})

test('sync state directive should synchronize state and textarea', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'After' }">
      <textarea d-sync:state="message">Initial</textarea>

      <div d-text="message">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const textarea = window.document.querySelector('textarea')
  const div = window.document.querySelector('div[d-text]')
  expect(textarea.value).toBe('After')
  expect(div.textContent).toBe('After')
})

test('sync state directive should synchronize state and checkboxes', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ selected: ['after'] }">
      <input type="checkbox" d-sync:state="selected" value="before" checked>
      <input type="checkbox" d-sync:state="selected" value="after">

      <div d-text="selected.join(', ')">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const checkboxes = window.document.querySelectorAll('input[type="checkbox"]')
  const div = window.document.querySelector('div[d-text]')
  expect(checkboxes[0].checked).toBe(false)
  expect(checkboxes[1].checked).toBe(true)
  expect(div.textContent).toBe('after')
})

