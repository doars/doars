import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from '../test-setup.js'

import Doars from '../../../src/DoarsExecute.js'

describe('Show Directive', () => {
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

  test('show directive should show element when true', async () => {
    container.innerHTML = `
      <div d-state="{}">
        <div d-show="true" style="display: none;">
          Hello world!
        </div>
      </div>
    `

    doars = new Doars({
      root: container,
    })
    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    const div = container.querySelector('div[d-show]')
    expect(div.style.display).toBe('')
  })

  test('show directive should hide element when false', async () => {
    container.innerHTML = `
      <div d-state="{}">
        <div d-show="false">
          Hello world!
        </div>
      </div>
    `

    doars = new Doars({
      root: container,
    })
    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    const div = container.querySelector('div[d-show]')
    expect(div.style.display).toBe('none')
  })

  test('show directive should handle promises', async () => {
    doars = new Doars({
      root: container,
    })

    // Set simple context for promise.
    doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

    container.innerHTML = `
      <div d-state="{}">
        <div d-show="resolveInTime(true)" style="display: none;">
          Hello world!
        </div>
      </div>
    `

    doars.enable()

    // Wait for promise.
    await new Promise(resolve => setTimeout(resolve, 10))

    // Assert shown.
    const div = container.querySelector('div[d-show]')
    expect(div.style.display).toBe('')
  })
})
