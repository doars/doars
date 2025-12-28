import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('nextSibling context should access next component', async () => {
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
      <div d-state="{}"></div>
      <div d-state="{}"></div>
      <div d-state="{ nextMessage: '' }" d-initialized="$state.nextMessage = $nextSibling.$state.message">
        <span d-text="$state.nextMessage"></span>
      </div>
      <div d-state="{ message: 'success' }"></div>
      <div d-state="{}"></div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('success')
})

test('previousSibling context should access previous component', async () => {
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
      <div d-state="{}"></div>
      <div d-state="{ message: 'success' }"></div>
      <div d-state="{ prevMessage: '' }" d-initialized="$state.prevMessage = $previousSibling.$state.message">
        <span d-text="$state.prevMessage"></span>
      </div>
      <div d-state="{}"></div>
      <div d-state="{}"></div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('success')
})

test('siblings context should provide sibling components', async () => {
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
  doars.setSimpleContext('collectSiblings', function(siblings) {
    captured.messages = siblings.map(s => s.$state.message).filter(Boolean)
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-state="{ message: 'first' }"></div>
      <div d-state="{ message: 'previous' }"></div>
      <div d-state="{}" d-initialized="collectSiblings($siblings)"></div>
      <div d-state="{ message: 'next' }"></div>
      <div d-state="{ message: 'last' }"></div>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert siblings captured.
  expect(captured.messages).toEqual(['first', 'previous', 'next', 'last'])
})