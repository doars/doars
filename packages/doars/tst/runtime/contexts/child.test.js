import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Child Context', () => {
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

  test('children context should list child components', async () => {
    // Local state for the test.
    const captured = {}

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}" d-initialized="setCount($children.length)">
        <div d-state="{}"></div>
        <div d-state="{}"></div>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context.
    doars.setSimpleContext('setCount', (count) => {
      captured.count = count.toString()
    })

    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert.
    expect(captured.count).toBe('2')
  })

  test('child context should access specific child component', async () => {
    // Local state for the test.
    const captured = {}

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}" d-initialized="setMessage($children[0].$state.message)">
        <div d-state="{ message: 'General Kenobi' }"></div>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context.
    doars.setSimpleContext('setMessage', (message) => {
      captured.message = message
    })

    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert.
    expect(captured.message).toBe('General Kenobi')
  })
})
