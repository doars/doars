import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

test('root option restricts scanning', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'Broken' }">
      <div d-text="message">Works</div>
    </div>
    <div d-state="{ message: 'Works' }">
      <div d-text="message">Broken</div>
    </div>
  `

  // Create Doars with root selector.
  const doars = new Doars({
    root: window.document.querySelector('body > div:nth-child(2)'),
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert only the second div is processed.
  const divs = window.document.querySelectorAll('div[d-text]')
  expect(divs[0].textContent).toBe('Works') // first div not processed
  expect(divs[1].textContent).toBe('Works') // second div processed
})