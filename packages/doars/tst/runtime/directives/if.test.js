import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('If Directive', () => {
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

test('if directive should conditionally render', async () => {
  // Set the container HTML.
  container.innerHTML = `
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
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const visibleSpan = container.querySelector('span')
  expect(visibleSpan.textContent.trim()).toBe('Should be visible')

  const notVisibleSpans = container.querySelectorAll('span')
  expect(notVisibleSpans.length).toBe(1)
})
})