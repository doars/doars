import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Cloak Directive', () => {
  let container, doars

  beforeEach(() => {
    // Create a unique container for each test.
    container = document.createElement('div')
    container.id = 'test-container-' + Math.random().toString(36).substr(2, 9)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up after each test.
    if (doars) {
      doars.disable()
      doars = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
  })

test('cloak directive should remove cloak attribute', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      Does cloaking work?

      <span d-cloak>
        Yes!
      </span>
    </div>
  `

  // Add CSS for cloak.
  const style = document.createElement('style')
  style.textContent = '[d-cloak] { display: none; }'
  document.head.appendChild(style)

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert cloak is removed.
  const span = container.querySelector('span')
  expect(span.hasAttribute('d-cloak')).toBe(false)
})
})