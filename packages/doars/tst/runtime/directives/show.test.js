import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('show directive should show element when true', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="true" style="display: none;">
        Hello world!
      </div>
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
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should hide element when false', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="false">
        Hello world!
      </div>
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
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('none')
})

test('show directive should handle promises', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  // Set simple context for promise.
  doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="resolveInTime(true)" style="display: none;">
        Hello world!
      </div>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert shown.
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should handle transitions on show', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="true" style="display: none;" d-transition:in=".transition" d-transition:in.from=".opacity-0"
        d-transition:in.to=".opacity-1">
        Hello world!
      </div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert shown.
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should handle transitions on hide', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="false" d-transition:out=".transition" d-transition:out.from=".opacity-1"
        d-transition:out.to=".opacity-0">
        Hello world!
      </div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert hidden.
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})