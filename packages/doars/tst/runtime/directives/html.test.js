import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Html Directive', () => {
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

  test('html directive should set innerHTML', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <span d-html="'<h1>After</h1>'">
          Before
        </span>
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
    const span = container.querySelector('span')
    expect(span.innerHTML).toBe('<h1>After</h1>')
  })

  test('html directive should decode HTML entities', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <span d-html.decode="'&lt;h1&gt;After&lt;/h1&gt;'">
          Before
        </span>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert decoded HTML.
    const span = container.querySelector('span')
    expect(span.innerHTML).toBe('<h1>After</h1>')
  })

  test('html directive should handle promises', async () => {
    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context for promise.
    doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <span d-html="resolveInTime('<h1>After</h1>')">
          Before
        </span>
      </div>
    `

    // Enable Doars.
    doars.enable()

    // Wait for promise.
    await new Promise(resolve => setTimeout(resolve, 10))

    // Assert HTML set.
    const span = container.querySelector('span')
    expect(span.innerHTML).toBe('<h1>After</h1>')
  })

  test('html directive should morph HTML structure', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <span d-html.morph="'<h1>After</h1>'">
          <span>
            Before
          </span>
        </span>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert morphed HTML.
    const span = container.querySelector('span')
    expect(span.innerHTML.trim()).toBe('<h1>After</h1>')
  })
})
