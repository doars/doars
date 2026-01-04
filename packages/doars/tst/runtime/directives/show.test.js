import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Show Directive', () => {
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

  test('show directive should show element when true', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-show="true" style="display: none;">
          Hello world!
        </div>
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
    const div = container.querySelector('div[d-show]')
    expect(div.style.display).toBe('')
  })

  test('show directive should hide element when false', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-show="false">
          Hello world!
        </div>
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
    const div = container.querySelector('div[d-show]')
    expect(div.style.display).toBe('none')
  })

  test('show directive should handle promises', async () => {
    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context for promise.
    doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <div d-show="resolveInTime(true)" style="display: none;">
          Hello world!
        </div>
      </div>
    `

    // Enable Doars.
    doars.enable()

    // Wait for promise.
    await new Promise(resolve => setTimeout(resolve, 10))

    // Assert shown.
    const div = container.querySelector('div[d-show]')
    expect(div.style.display).toBe('')
  })
})
