import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from './test-setup.js'

// Import Doars variants
import DoarsCall from '../../src/DoarsCall.js'
import DoarsExecute from '../../src/DoarsExecute.js'
import DoarsInterpret from '../../src/DoarsInterpret.js'

describe('Processors', () => {
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

  test('call processor allows calling functions without parentheses', async () => {
    let captured = false

    container.innerHTML = `
      <div d-state d-initialized="capture"></div>
    `

    // Create Doars with call processor.
    doars = new DoarsCall({
      root: container,
      processor: 'call',
    })

    doars.setSimpleContext('capture', () => {
      captured = true
    })

    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    expect(captured).toBe(true)
  })

  test('execute processor executes JavaScript code', async () => {
    let captured = false

    container.innerHTML = `
      <div d-state d-initialized="capture()"></div>
    `

    // Create Doars with execute processor.
    doars = new DoarsExecute({
      root: container,
    })

    doars.setSimpleContext('capture', () => {
      captured = true
    })

    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    expect(captured).toBe(true)
  })

  test('interpret processor interprets expressions with simple contexts', async () => {
    let captured = false

    container.innerHTML = `
      <div d-state d-initialized="capture()"></div>
    `

    // Create Doars with interpret processor.
    doars = new DoarsInterpret({
      root: container,
    })

    doars.setSimpleContext('capture', () => {
      captured = true
    })

    doars.enable()

    await new Promise(resolve => setTimeout(resolve, 1))

    expect(captured).toBe(true)
  })
})
