import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Text Directive', () => {
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

  test('text directive should set text content', async () => {
    // Set the container HTML.
    container.innerHTML = `
    <div d-state="{}">
      <span d-text="'&lt;h1&gt;After&lt;/h1&gt;'">
        Before
      </span>
    </div>
  `

    // Create a Doars instance.
    doars = new Doars({
      root: container,
    })

    // Enable Doars.
    doars.enable()

    // Wait for directives to process.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert the text content.
    const span = container.querySelector('span')
    expect(span.textContent).toBe('<h1>After</h1>')
  })

  test('text directive should handle promises', async () => {
    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context for promise.
    doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

    // Set the container HTML.
    container.innerHTML = `
    <div d-state="{}">
      <span d-text="resolveInTime('<h1>After</h1>')">
        Before
      </span>
    </div>
  `

    // Enable Doars.
    doars.enable()

    // Wait for promise.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert text set.
    const span = container.querySelector('span')
    expect(span.textContent).toBe('<h1>After</h1>')
  })
})
