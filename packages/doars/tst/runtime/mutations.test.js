import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

test('adding attribute to element triggers directive processing', async () => {
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
      <span>Before</span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Get the component and span.
  const component = window.document.querySelector('[d-state]')
  const span = window.document.querySelector('span')

  // Add d-text attribute.
  span.setAttribute('d-text', "'After'")

  // Trigger update by changing state.
  component.setAttribute('d-state', '{ updated: true }')

  // Wait for mutation processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Assert text updated.
  expect(span.textContent).toBe('After')
})

test('adding component to DOM triggers processing', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div id="container"></div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Get container.
  const container = window.document.getElementById('container')

  // Add new component.
  const newComponent = window.document.createElement('div')
  newComponent.setAttribute('d-state', '{}')
  const span = window.document.createElement('span')
  span.setAttribute('d-text', "'Added'")
  newComponent.appendChild(span)
  container.appendChild(newComponent)

  // Wait for mutation processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Assert new component processed.
  expect(span.textContent).toBe('Added')
})

test('adding element to component triggers directive processing', async () => {
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

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Get the component.
  const component = window.document.querySelector('[d-state]')

  // Add new element with directive.
  const span = window.document.createElement('span')
  span.setAttribute('d-text', "'Added'")
  component.appendChild(span)

  // Wait for mutation processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Assert element processed.
  expect(span.textContent).toBe('Added')
})

test('changing attribute value triggers directive re-processing', async () => {
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
      <span d-text="'Before'">Initial</span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Get the span.
  const span = window.document.querySelector('span')

  // Change d-text attribute.
  span.setAttribute('d-text', "'After'")

  // Wait for mutation processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Assert text updated.
  expect(span.textContent).toBe('After')
})

test('changing d-state attribute does not trigger re-processing', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'Before' }">
      <span d-text="message">Initial</span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial processing.
  await new Promise(resolve => setTimeout(resolve, 1))

  // Get the component and span.
  const component = window.document.querySelector('[d-state]')
  const span = window.document.querySelector('span')

  // Change d-state attribute.
  component.setAttribute('d-state', "{ message: 'After' }")

  // Wait for potential mutation processing.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert text not updated (state change not handled).
  expect(span.textContent).toBe('Before')
})