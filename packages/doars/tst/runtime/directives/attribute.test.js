import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('Attribute Directive', () => {
  let container, doars

  beforeEach(() => {
    // Create a unique container for each test.
    container = document.createElement('div')
    container.id = 'test-container-' + Math.random().toString(36).substr(2, 9)
    document.body.appendChild(container)
  })

  afterEach(() => {
    // Clean up after each test.
    if (doars) {
      doars.disable()
      doars = null
    }
    if (container && container.parentNode) {
      container.parentNode.removeChild(container)
    }
    container = null
  })

test('attribute directive should set attributes', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <span d-attribute:style="{ display: 'none' }">
        Hidden?
      </span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const span = container.querySelector('span')
  expect(span.style.display).toBe('none')
})

test('attribute directive should set value attributes', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <input type="text" value="before" d-attribute:value="'after'">
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const input = container.querySelector('input')
  expect(input.value).toBe('after')
})

test('attribute directive should handle promises', async () => {
  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context for promise.
  doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <input type="text" value="before" d-attribute:value="resolveInTime('after')">
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert value set.
  const input = container.querySelector('input')
  expect(input.value).toBe('after')
})

test('attribute directive should set checked on radios', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <input type="radio" name="radio-name" d-attribute:checked="false">
      <input type="radio" name="radio-name" d-attribute:checked="true">
      <input type="radio" name="radio-name" d-attribute:checked="true">
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert checked.
  const radios = container.querySelectorAll('input[type="radio"]')
  expect(radios[0].checked).toBe(false)
  expect(radios[1].checked).toBe(false)
  expect(radios[2].checked).toBe(true)
})

test('attribute directive should remove style properties', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <span style="background-color: yellow;" d-attribute:style="{ 'background-color': undefined }">
        Red
      </span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert style removed.
  const span = container.querySelector('span')
  expect(span.style.backgroundColor).toBe('')
})

test('attribute directive should set value and handle events', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{ value: 'initial' }">
      <input d-attribute:value="'after'" d-on:change="$state.value = $event.target.value" value="before" />

      <span d-text="value"></span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert initial value set.
  const input = container.querySelector('input')
  const span = container.querySelector('span')
  expect(input.value).toBe('after')
  expect(span.textContent).toBe('initial')

  // Simulate change.
  input.value = 'changed'
  input.dispatchEvent(new window.Event('change', { bubbles: true }))

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert value updated.
  expect(span.textContent).toBe('changed')
})

test('attribute directive should set class attributes', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <div d-state="{}">
      <span d-attribute:class="'a b'"></span>
      <span class="a" d-attribute:class="[ 'a', 'b' ]"></span>
      <span class="c" d-attribute:class="{ a: true, b: true, c: false }"></span>
    </div>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert classes.
  const spans = container.querySelectorAll('span')
  expect(spans[0].className).toBe('a b')
  expect(spans[1].className).toBe('a b')
  expect(spans[2].className).toBe('a b')
})
})