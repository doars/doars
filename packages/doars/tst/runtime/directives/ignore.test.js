import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('ignore directive should prevent processing inside', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div>
      <!-- Outside any component. -->
      <div d-ignore>
        <div d-state="{}">
          <span d-text="'Should not be seen'">
            Should not change
          </span>
        </div>
      </div>

      <!-- Inside a component. -->
      <div d-state="{}">
        <div d-ignore>
          <span d-text="'Should not be seen'">
            Should not change
          </span>
        </div>
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

  // Assert spans not changed.
  const spans = window.document.querySelectorAll('span')
  expect(spans[0].textContent.trim()).toBe('Should not change')
  expect(spans[1].textContent.trim()).toBe('Should not change')
})

test('ignore directive should be added dynamically', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'Should not change after click' }">
      <div>
        <span d-text="message">
          Before
        </span>
      </div>

      <button d-on:click="document.querySelector('div > div').setAttribute('d-ignore', true); $state.updated = true">
        Click me!
      </button>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial.
  await new Promise(resolve => setTimeout(resolve, 10))

  // Get span.
  const span = window.document.querySelector('span')
  expect(span.textContent.trim()).toBe('Should not change after click')

  // Click button.
  const button = window.document.querySelector('button')
  button.click()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 10))

  // Assert text not changed.
  expect(span.textContent.trim()).toBe('Should not change after click')
})

test('ignore directive should be removed dynamically', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'Should only be visible after ignore is removed!' }">
      <div d-ignore>
        <span d-text="message">
          Before
        </span>
      </div>

      <button d-on:click="$component.querySelector('[d-ignore]').removeAttribute('d-ignore'); $state.updated = true">
        Remove ignore!
      </button>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait for initial.
  await new Promise(resolve => setTimeout(resolve, 10))

  // Get span.
  const span = window.document.querySelector('span')
  expect(span.textContent.trim()).toBe('Before')

  // Click button.
  const button = window.document.querySelector('button')
  button.click()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 10))

  // Assert text changed.
  expect(span.textContent.trim()).toBe('Should only be visible after ignore is removed!')
})