import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from '../test-setup.js'

import Doars from '../../../src/DoarsExecute.js'

describe('References Context', () => {
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

  test('references context should provide referenced elements', async () => {
    container.innerHTML = `
      <div d-state="{ refCount: '0' }" d-initialized="$state.refCount = Object.keys($references).length.toString()">
        <span d-text="$state.refCount"></span>
        <input d-reference="'myInput'">
      </div>
    `

    doars = new Doars({
      root: container,
    })
    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    const span = container.querySelector('span')
    expect(span.textContent).toBe('1')
  })
})
