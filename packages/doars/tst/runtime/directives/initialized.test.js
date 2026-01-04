import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Initialized Directive', () => {
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

  test('initialized directive should run on component init', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ init: false }" d-initialized="$state.init = true">
        <span d-text="$state.init ? 'true' : 'false'"></span>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert initialized.
    const span = container.querySelector('span')
    expect(span.textContent).toBe('true')
  })

  test('initialized directive should run on element init', async () => {
    // Local state for the test.
    const captured = {}

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-initialized="captured.initialized = true"></div>
      </div>
    `

    // Make captured available in the expression.
    global.captured = captured

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert initialized.
    expect(captured.initialized).toBe(true)
  })
})
