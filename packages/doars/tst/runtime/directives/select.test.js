import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Select Directive', () => {
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

  test('select directive should set multiple select values', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <select d-select="[ 'after', 'after2' ]" multiple>
          <option value="before" selected>Before</option>
          <option value="after">After</option>
          <option value="after2">After2</option>
        </select>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert multiple selected.
    const select = container.querySelector('select')
    const selected = Array.from(select.selectedOptions).map(o => o.value)
    expect(selected).toEqual(['after', 'after2'])
  })

  test('select directive should set radio value', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <input type="radio" name="radio-name" d-select="'after'" value="initial" checked>
        <input type="radio" name="radio-name" d-select="'after'" value="before">
        <input type="radio" name="radio-name" d-select="'after'" value="after">
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert radio selected.
    const radios = container.querySelectorAll('input[type="radio"]')
    expect(radios[0].checked).toBe(false)
    expect(radios[1].checked).toBe(false)
    expect(radios[2].checked).toBe(true)
  })

  test('select directive should set select value', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <select d-select="'after'">
          <option value="before" selected>Before</option>
          <option value="after">After</option>
        </select>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Assert value set.
    const select = container.querySelector('select')
    expect(select.value).toBe('after')
  })
})
