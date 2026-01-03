import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Element Context', () => {
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

  test('element context should provide element reference', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <ol d-text="$element.tagName"></ol>
        <p d-text="$element.tagName"></p>
        <span d-text="$element.tagName"></span>
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
    const ol = container.querySelector('ol')
    expect(ol.textContent).toBe('OL')
    const p = container.querySelector('p')
    expect(p.textContent).toBe('P')
    const span = container.querySelector('span')
    expect(span.textContent).toBe('SPAN')
  })
})
