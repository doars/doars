import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from './test-setup.js'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

describe('Function State Simple Context', () => {
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

  test('simple context function can be called', async () => {
    // Local state for the test.
    const captured = {}

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="">
        <button d-on:click="hello()"></button>
      </div>
    `

    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple context.
    doars.setSimpleContext('hello', () => {
      captured.called = true
    })

    // Enable Doars.
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Click button.
    const button = container.querySelector('button')
    button.click()

    // Wait for event.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert function called.
    expect(captured.called).toBe(true)
  })

  test('simple context function initializes state', async () => {
    // Local state for the test.
    const captured = {}

    // Set the container HTML.
    container.innerHTML = `
      <div d-state="createState()" d-initialized="setMessage($state.message)"></div>
    `

    // Create Doars.
    doars = new Doars({
      root: container,
    })

    // Set simple contexts.
    doars.setSimpleContext('createState', () => {
      return {
        message: 'Hello there!'
      }
    })
    doars.setSimpleContext('setMessage', (message) => {
      captured.message = message
    })

    // Enable Doars.
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert state initialized.
    expect(captured.message).toBe('Hello there!')
  })
})
