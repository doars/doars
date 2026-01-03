import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('NextTick Context', () => {
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

  test('nextTick context should defer execution', async () => {
    container.innerHTML = `
      <div d-state="{}" d-initialized="$nextTick(() => setTicked())"></div>
    `

    doars = new Doars({
      root: container,
    })

    // Set simple context with closure.
    let captured = false
    doars.setSimpleContext('setTicked', function() {
      captured = true
    })

    // Assert nextTick not yet executed.
    expect(captured).toBe(false)

    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert nextTick executed.
    expect(captured).toBe(true)
  })
})
