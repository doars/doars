import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Sibling Context', () => {
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

  test('nextSibling context should access next component', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-state="{}"></div>
        <div d-state="{}"></div>
        <div d-state="{ nextMessage: '' }" d-initialized="$state.nextMessage = $nextSibling.$state.message">
          <span d-text="$state.nextMessage"></span>
        </div>
        <div d-state="{ message: 'success' }"></div>
        <div d-state="{}"></div>
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
    expect(span.textContent).toBe('success')
  })

  test('previousSibling context should access previous component', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-state="{}"></div>
        <div d-state="{ message: 'success' }"></div>
        <div d-state="{ prevMessage: '' }" d-initialized="$state.prevMessage = $previousSibling.$state.message">
          <span d-text="$state.prevMessage"></span>
        </div>
        <div d-state="{}"></div>
        <div d-state="{}"></div>
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
    expect(span.textContent).toBe('success')
  })

  test('siblings context should provide sibling components', async () => {
    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Local state for the test.
    const captured = {}

    // Set simple context with closure.
    doars.setSimpleContext('collectSiblings', function(siblings) {
      captured.messages = siblings.map(s => s.$state.message).filter(Boolean)
    })

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-state="{ message: 'first' }"></div>
        <div d-state="{ message: 'previous' }"></div>
        <div d-state="{}" d-initialized="collectSiblings($siblings)"></div>
        <div d-state="{ message: 'next' }"></div>
        <div d-state="{ message: 'last' }"></div>
      </div>
    `

    // Enable Doars.
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert siblings captured.
    expect(captured.messages).toEqual(['first', 'previous', 'next', 'last'])
  })
})
