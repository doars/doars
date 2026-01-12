import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

import { document } from '../test-setup.js'

import Doars from '../../../src/DoarsExecute.js'

describe('Text Directive', () => {
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

  test('text directive should set text content', async () => {
    container.innerHTML = `
      <div d-state="{}">
        <span d-text="'&lt;h1&gt;After&lt;/h1&gt;'">
          Before
        </span>
      </div>
    `

    // Create a Doars instance.
    doars = new Doars({
      root: container,
    })

    doars.enable()

    // Wait for directives to process.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert the text content.
    const span = container.querySelector('span')
    expect(span.textContent).toBe('<h1>After</h1>')
  })

  test('text directive should handle promises', async () => {
    doars = new Doars({
      root: container,
    })

    // Set simple context for promise.
    doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

    container.innerHTML = `
      <div d-state="{}">
        <span d-text="resolveInTime('<h1>After</h1>')">
          Before
        </span>
      </div>
    `

    doars.enable()

    // Wait for promise.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert text set.
    const span = container.querySelector('span')
    expect(span.textContent).toBe('<h1>After</h1>')
  })
})
