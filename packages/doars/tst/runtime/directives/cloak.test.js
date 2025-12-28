import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('cloak directive should remove cloak attribute', async () => {
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
      Does cloaking work?

      <span d-cloak>
        Yes!
      </span>
    </div>
  `

  // Add CSS for cloak.
  const style = window.document.createElement('style')
  style.textContent = '[d-cloak] { display: none; }'
  window.document.head.appendChild(style)

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert cloak is removed.
  const span = window.document.querySelector('span')
  expect(span.hasAttribute('d-cloak')).toBe(false)
})