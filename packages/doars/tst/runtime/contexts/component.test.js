import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Component Context', () => {
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

  test('component context should provide component instance', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ hasComponent: false }" d-initialized="$state.hasComponent = !!$component">
        <span d-text="$state.hasComponent ? 'true' : 'false'"></span>
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
    expect(span.textContent).toBe('true')
  })
})
