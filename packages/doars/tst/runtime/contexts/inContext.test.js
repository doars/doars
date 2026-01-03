import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('InContext Context', () => {
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

  test('inContext should execute function in component context', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ message: 'General Kenobi.', logged: '' }" d-initialized="$inContext(({ $state }) => { $state.logged = $state.message })">
        <span d-text="$state.logged"></span>
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
    expect(span.textContent).toBe('General Kenobi.')
  })
})
