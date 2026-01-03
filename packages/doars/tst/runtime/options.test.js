import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from './test-setup.js'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

describe('Options', () => {
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

  test('root option restricts scanning', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ message: 'Broken' }">
        <div d-text="message">Works</div>
      </div>
      <div d-state="{ message: 'Works' }">
        <div d-text="message">Broken</div>
      </div>
    `

    // Create Doars with root selector.
    doars = new Doars({
      root: container.querySelector('div:nth-child(2)'),
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert only the second div is processed.
    const divs = container.querySelectorAll('div[d-text]')
    expect(divs[0].textContent).toBe('Works') // first div not processed
    expect(divs[1].textContent).toBe('Works') // second div processed
  })
})
