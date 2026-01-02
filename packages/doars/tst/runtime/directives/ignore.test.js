import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Ignore Directive', () => {
  let container, doars

  beforeEach(() => {
    // Create a unique container for each test.
    container = document.createElement('div')
    container.id = 'test-container-' + Math.random().toString(36).substr(2, 9)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up after each test.
    doars = null
    if (container && container.parentNode) {
      document.body.removeChild(container)
    }
    container = null
  })

  test('ignore directive should prevent processing inside', async () => {
    // Set the container HTML.
    container.innerHTML = `
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
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert spans not changed.
    const spans = container.querySelectorAll('span')
    expect(spans[0].textContent.trim()).toBe('Should not change')
    expect(spans[1].textContent.trim()).toBe('Should not change')
  })

  test('ignore directive should be added dynamically', async () => {
    // Set the container HTML.
    container.innerHTML = `
    <div d-state="{ message: 'Should not change after ignore directive' }">
      <div>
        <span d-text="message">
          Before
        </span>
      </div>
    </div>
  `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get span.
    const span = container.querySelector('span')
    expect(span.textContent.trim()).toBe('Should not change after ignore directive')

    // Add ignore directive.
    const innerDiv = container.querySelector('[d-state] > div')
    innerDiv.setAttribute('d-ignore', '')

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert text not changed.
    expect(span.textContent.trim()).toBe('Should not change after ignore directive')
  })

  test('ignore directive should be removed dynamically', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ message: 'Should only be visible after ignore is removed!' }">
        <div d-ignore>
          <span d-text="message">
            Before
          </span>
        </div>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Get span.
    const span = container.querySelector('span')
    expect(span.textContent.trim()).toBe('Before')

    // Remove ignore directive.
    const innerDiv = container.querySelector('[d-ignore]')
    innerDiv.removeAttribute('d-ignore')

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert text changed.
    expect(span.textContent.trim()).toBe('Should only be visible after ignore is removed!')
  })
})
