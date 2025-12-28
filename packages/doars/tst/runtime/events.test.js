import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

test('component updated event is dispatched', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}"></div>
  `

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  let eventFired = false
  const div = window.document.querySelector('[d-state]')
  div.addEventListener('d-updated', () => {
    eventFired = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert event was fired.
  expect(eventFired).toBe(true)
})

test('component destroyed event is dispatched', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}"></div>
  `

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  let eventFired = false
  const div = window.document.querySelector('[d-state]')
  div.addEventListener('d-destroyed', () => {
    eventFired = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Disable Doars.
  doars.disable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert event was fired.
  expect(eventFired).toBe(true)
})

test('library enabled event is dispatched', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}"></div>
  `

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  let eventFired = false
  doars.addEventListener('enabled', () => {
    eventFired = true
  })

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert event was fired.
  expect(eventFired).toBe(true)
})