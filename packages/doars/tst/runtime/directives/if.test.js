import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('if directive should conditionally render', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ a: true, b: false }">
      <template d-if="a">
        <span>
          Should be visible
        </span>
      </template>

      <template d-if="b">
        <span>
          Should NOT be visible
        </span>
      </template>
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
  const visibleSpan = window.document.querySelector('span')
  expect(visibleSpan.textContent.trim()).toBe('Should be visible')

  const notVisibleSpans = window.document.querySelectorAll('span')
  expect(notVisibleSpans.length).toBe(1)
})