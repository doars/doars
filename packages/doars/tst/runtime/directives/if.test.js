import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('If Directive', () => {
  let container, doars

  beforeEach(() => {
    container = document.createElement('div')
    document.body.appendChild(container)
  })

  afterEach(() => {
    doars.disable()
    doars = null
    document.body.removeChild(container)
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
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert.
    const visibleSpan = container.querySelector('span')
    expect(visibleSpan.textContent.trim()).toBe('Should be visible')

    const notVisibleSpans = container.querySelectorAll('span')
    expect(notVisibleSpans.length).toBe(1)
  })
})
