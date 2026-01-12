import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from '../test-setup.js'

import Doars from '../../../src/DoarsExecute.js'

describe('Cloak Directive', () => {
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

  test('cloak directive should remove cloak attribute', async () => {
    container.innerHTML = `
      <div d-state="{}">
        <span d-cloak></span>
      </div>
    `

    doars = new Doars({
      root: container,
    })
    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert cloak is removed.
    const span = container.querySelector('span')
    expect(span.hasAttribute('d-cloak')).toBe(false)
  })
})
