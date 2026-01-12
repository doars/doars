import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from '../test-setup.js'

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
    let captured = false

    container.innerHTML = `
      <div d-state="{}" d-initialized="$nextTick(({ capture }) => capture())"></div>
    `

    doars = new Doars({
      root: container,
    })

    doars.setSimpleContext('capture', function () {
      captured = true
    })

    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    expect(captured).toBe(true)
  })
})
