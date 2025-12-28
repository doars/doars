import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('on click directive should handle click events', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ clicked: 'false' }">
      <button d-on:click="$state.clicked = 'true'">
        Click
      </button>
      <span d-text="$state.clicked">false</span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial text.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('false')

  // Simulate click.
  const button = window.document.querySelector('button')
  button.click()

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert text changed.
  expect(span.textContent).toBe('true')
})

test('on click once directive should fire only once', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ clicked: 'false' }">
      <button d-on:click.once="$state.clicked = 'true'">
        Click
      </button>
      <span d-text="$state.clicked"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Click twice.
  const button = window.document.querySelector('button')
  button.click()
  await new Promise(resolve => setTimeout(resolve, 0))
  button.click()
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert clicked once.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})

test('on click outside directive handles outside clicks', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ clicked: 'false' }">
      <button d-on:click.outside="$state.clicked = 'true'">
        Click
      </button>
      <span d-text="$state.clicked"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Click on body (outside button).
  window.document.body.click()

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})

test('on keydown directive should handle key events', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ key: '' }">
      <input type="text" d-on:keydown="$state.key = $event.key">
      <span d-text="$state.key"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Simulate keydown.
  const input = window.document.querySelector('input')
  const event = new window.KeyboardEvent('keydown', { key: 'a' })
  input.dispatchEvent(event)

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert key set.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('a')
})

test('on keydown buffer custom directive should buffer events', async () => {
   // Create a new window.
   const window = new Window()

   // Set globals for Doars
   global.document = window.document
   global.MutationObserver = window.MutationObserver
   global.requestAnimationFrame = window.requestAnimationFrame
   global.HTMLElement = window.HTMLElement

   // Local state for the test.
   const captured = { count: 0 }

   // Set the document body.
   window.document.body.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.buffer-5="capture()">
     </div>
   `

   // Create and enable Doars.
   const doars = new Doars({
     root: window.document.body,
   })

   // Set simple context for capturing.
   doars.setSimpleContext('capture', () => {
     captured.count++
   })

   doars.enable()

   // Wait.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Focus input.
   const input = window.document.querySelector('input')
   input.focus()

   // Simulate keydowns.
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'c', bubbles: true }))
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'd', bubbles: true }))
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'e', bubbles: true }))

   // Wait for buffer.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Assert called once.
   expect(captured.count).toBe(1)
})

test('on keydown debounce custom directive should debounce events', async () => {
   // Create a new window.
   const window = new Window()

   // Set globals for Doars
   global.document = window.document
   global.MutationObserver = window.MutationObserver
   global.requestAnimationFrame = window.requestAnimationFrame
   global.HTMLElement = window.HTMLElement

   // Local state for the test.
   const captured = { count: 0 }

   // Set the document body.
   window.document.body.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.debounce-100="capture()">
     </div>
   `

   // Create and enable Doars.
   const doars = new Doars({
     root: window.document.body,
   })

   // Set simple context for capturing.
   doars.setSimpleContext('capture', () => {
     captured.count++
   })

   doars.enable()

   // Wait.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Focus input.
   const input = window.document.querySelector('input')
   input.focus()

   // Simulate keydowns.
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

   // Wait less than debounce.
   await new Promise(resolve => setTimeout(resolve, 10))

   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

   // Wait for debounce.
   await new Promise(resolve => setTimeout(resolve, 150))

   // Assert called once.
   expect(captured.count).toBe(1)
})

test('on keydown debounce directive should debounce events', async () => {
   // Create a new window.
   const window = new Window()

   // Set globals for Doars
   global.document = window.document
   global.MutationObserver = window.MutationObserver
   global.requestAnimationFrame = window.requestAnimationFrame
   global.HTMLElement = window.HTMLElement

   // Local state for the test.
   const captured = { count: 0 }

   // Set the document body.
   window.document.body.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.debounce="capture()">
     </div>
   `

   // Create and enable Doars.
   const doars = new Doars({
     root: window.document.body,
   })

   // Set simple context for capturing.
   doars.setSimpleContext('capture', () => {
     captured.count++
   })

   doars.enable()

   // Wait.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Focus input.
   const input = window.document.querySelector('input')
   input.focus()

   // Simulate keydowns.
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

   // Wait less than default debounce (300ms).
   await new Promise(resolve => setTimeout(resolve, 200))

   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

   // Wait for debounce.
   await new Promise(resolve => setTimeout(resolve, 320))

   // Assert called once.
   expect(captured.count).toBe(1)
})

test('on keydown throttle directive should throttle events', async () => {
   // Create a new window.
   const window = new Window()

   // Set globals for Doars
   global.document = window.document
   global.MutationObserver = window.MutationObserver
   global.requestAnimationFrame = window.requestAnimationFrame
   global.HTMLElement = window.HTMLElement

   // Local state for the test.
   const captured = { count: 0 }

   // Set the document body.
   window.document.body.innerHTML = `
     <div d-state="{}">
       <input type="text" d-on:keydown.throttle="capture()">
     </div>
   `

   // Create and enable Doars.
   const doars = new Doars({
     root: window.document.body,
   })

   // Set simple context for capturing.
   doars.setSimpleContext('capture', () => {
     captured.count++
   })

   doars.enable()

   // Wait.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Focus input.
   const input = window.document.querySelector('input')
   input.focus()

   // Simulate keydowns.
   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'a', bubbles: true }))

   // Wait less than throttle (300ms).
   await new Promise(resolve => setTimeout(resolve, 200))

   input.dispatchEvent(new window.KeyboardEvent('keydown', { key: 'b', bubbles: true }))

   // Wait for throttle.
   await new Promise(resolve => setTimeout(resolve, 320))

    // Assert called once (throttled).
    expect(captured.count).toBe(1)
})
