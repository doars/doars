import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from '../test-setup.js'

import Doars from '../../../src/DoarsExecute.js'

describe('Watch Context', () => {
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

  test('watch context should trigger', async () => {
    doars = new Doars({
      root: container,
    })

    let captured = false

    // Set simple context with closure.
    doars.setSimpleContext('setWatched', function () {
      captured = true
    })

    container.innerHTML = `
      <div d-state="{ count: 0 }" d-initialized="$watch('count', () => setWatched())()"></div>
    `

    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert watch triggered immediately.
    expect(captured).toBe(true)
  })
})
