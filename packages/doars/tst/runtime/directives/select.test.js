import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('select directive should set multiple select values', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <select d-select="[ 'after', 'after2' ]" multiple>
        <option value="before" selected>Before</option>
        <option value="after">After</option>
        <option value="after2">After2</option>
      </select>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert multiple selected.
  const select = window.document.querySelector('select')
  const selected = Array.from(select.selectedOptions).map(o => o.value)
  expect(selected).toEqual(['after', 'after2'])
})

test('select directive should set radio value', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <input type="radio" name="radio-name" d-select="'after'" value="initial" checked>
      <input type="radio" name="radio-name" d-select="'after'" value="before">
      <input type="radio" name="radio-name" d-select="'after'" value="after">
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert radio selected.
  const radios = window.document.querySelectorAll('input[type="radio"]')
  expect(radios[0].checked).toBe(false)
  expect(radios[1].checked).toBe(false)
  expect(radios[2].checked).toBe(true)
})

test('select directive should set select value', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <select d-select="'after'">
        <option value="before" selected>Before</option>
        <option value="after">After</option>
      </select>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert value set.
  const select = window.document.querySelector('select')
  expect(select.value).toBe('after')
})