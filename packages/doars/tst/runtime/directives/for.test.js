import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from '../test-setup.js'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

describe('For Directive', () => {
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

test('for directive should render list', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ol d-state="{ array: ['Value A', 'Value B', 'Value C', 'Value D'] }">
      <template d-for="value of array">
        <li d-text="value"></li>
      </template>
    </ol>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('Value A')
  expect(lis[1].textContent).toBe('Value B')
  expect(lis[2].textContent).toBe('Value C')
  expect(lis[3].textContent).toBe('Value D')
})

test('for directive should iterate over string', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ol d-state="{}">
      <template d-for="value of 'text'">
        <li d-text="value"></li>
      </template>
    </ol>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('t')
  expect(lis[1].textContent).toBe('e')
  expect(lis[2].textContent).toBe('x')
  expect(lis[3].textContent).toBe('t')
})

test('for directive should iterate over array with index', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ol d-state="{ array: ['Value A', 'Value B', 'Value C', 'Value D'] }">
      <template d-for="(value, index) of array">
        <li d-text="index"></li>
      </template>
    </ol>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('0')
  expect(lis[1].textContent).toBe('1')
  expect(lis[2].textContent).toBe('2')
  expect(lis[3].textContent).toBe('3')
})

test('for directive should iterate over promise number', async () => {
  // Create Doars.
  doars = new Doars({
    root: container,
  })

  // Set simple context for promise.
  doars.setSimpleContext('resolveInTime', (result) => Promise.resolve(result))

  // Set the container HTML.
  container.innerHTML = `
    <ol d-state="{}">
      <template d-for="index of resolveInTime(4)">
        <li d-text="index"></li>
      </template>
    </ol>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('0')
  expect(lis[1].textContent).toBe('1')
  expect(lis[2].textContent).toBe('2')
  expect(lis[3].textContent).toBe('3')
})

test('for directive should iterate over object values', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
      <template d-for="(key, value) in object">
        <li d-text="value"></li>
      </template>
    </ul>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('Value A')
  expect(lis[1].textContent).toBe('Value B')
  expect(lis[2].textContent).toBe('Value C')
  expect(lis[3].textContent).toBe('Value D')
})

test('for directive should iterate over object keys', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
      <template d-for="key in object">
        <li d-text="key"></li>
      </template>
    </ul>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('a')
  expect(lis[1].textContent).toBe('b')
  expect(lis[2].textContent).toBe('c')
  expect(lis[3].textContent).toBe('d')
})

test('for directive should iterate over string with index', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ol d-state="{}">
      <template d-for="(value, index) of 'text'">
        <li d-text="index"></li>
      </template>
    </ol>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('0')
  expect(lis[1].textContent).toBe('1')
  expect(lis[2].textContent).toBe('2')
  expect(lis[3].textContent).toBe('3')
})

test('for directive should iterate over object with index', async () => {
  // Set the container HTML.
  container.innerHTML = `
    <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
      <template d-for="(key, value) in object">
        <li d-text="key"></li>
      </template>
    </ul>
  `

  // Create and enable Doars.
  doars = new Doars({
    root: container,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 100))

  // Assert.
  const lis = container.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('a')
  expect(lis[1].textContent).toBe('b')
  expect(lis[2].textContent).toBe('c')
  expect(lis[3].textContent).toBe('d')
})
})
