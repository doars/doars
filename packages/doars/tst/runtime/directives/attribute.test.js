import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('attribute directive should set attributes', async () => {
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
      <span d-attribute:style="{ display: 'none' }">
        Hidden?
      </span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const span = window.document.querySelector('span')
  expect(span.style.display).toBe('none')
})

test('attribute directive should set value attributes', async () => {
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
      <input type="text" value="before" d-attribute:value="'after'">
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const input = window.document.querySelector('input')
  expect(input.value).toBe('after')
})

test('attribute directive should handle promises', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Create Doars.
  const doars = new Doars({
    root: window.document.body,
  })

  // Set simple context for promise.
  doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <input type="text" value="before" d-attribute:value="resolveInTime('after')">
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert value set.
  const input = window.document.querySelector('input')
  expect(input.value).toBe('after')
})

test('attribute directive should set checked on radios', async () => {
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
      <input type="radio" name="radio-name" d-attribute:checked="false">
      <input type="radio" name="radio-name" d-attribute:checked="true">
      <input type="radio" name="radio-name" d-attribute:checked="true">
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert checked.
  const radios = window.document.querySelectorAll('input[type="radio"]')
  expect(radios[0].checked).toBe(false)
  expect(radios[1].checked).toBe(false)
  expect(radios[2].checked).toBe(true)
})

test('attribute directive should remove style properties', async () => {
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
      <span style="background-color: yellow;" d-attribute:style="{ 'background-color': undefined }">
        Red
      </span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert style removed.
  const span = window.document.querySelector('span')
  expect(span.style.backgroundColor).toBe('')
})

test('attribute directive should set value and handle events', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ value: 'initial' }">
      <input d-attribute:value="'after'" d-on:change="$state.value = $event.target.value" value="before" />

      <span d-text="value"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial value set.
  const input = window.document.querySelector('input')
  const span = window.document.querySelector('span')
  expect(input.value).toBe('after')
  expect(span.textContent).toBe('initial')

  // Simulate change.
  input.value = 'changed'
  input.dispatchEvent(new window.Event('change', { bubbles: true }))

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert value updated.
  expect(span.textContent).toBe('changed')
})

test('attribute directive should set class attributes', async () => {
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
      <span d-attribute:class="'a b'"></span>
      <span class="a" d-attribute:class="[ 'a', 'b' ]"></span>
      <span class="c" d-attribute:class="{ a: true, b: true, c: false }"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert classes.
  const spans = window.document.querySelectorAll('span')
  expect(spans[0].className).toBe('a b')
  expect(spans[1].className).toBe('a b')
  expect(spans[2].className).toBe('a b')
})