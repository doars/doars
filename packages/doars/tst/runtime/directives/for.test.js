import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

test('for directive should render list', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <ol d-state="{ array: ['Value A', 'Value B', 'Value C', 'Value D'] }">
      <template d-for="value of array">
        <li d-text="value"></li>
      </template>
    </ol>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const lis = window.document.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('Value A')
  expect(lis[1].textContent).toBe('Value B')
  expect(lis[2].textContent).toBe('Value C')
  expect(lis[3].textContent).toBe('Value D')
})

test('for directive should iterate over string', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <ol d-state="{}">
      <template d-for="value of 'text'">
        <li d-text="value"></li>
      </template>
    </ol>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const lis = window.document.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('t')
  expect(lis[1].textContent).toBe('e')
  expect(lis[2].textContent).toBe('x')
  expect(lis[3].textContent).toBe('t')
})

test('for directive should iterate over array with index', async () => {
   // Create a new window.
   const window = new Window()

   // Set globals for Doars
   global.document = window.document
   global.MutationObserver = window.MutationObserver
   global.requestAnimationFrame = window.requestAnimationFrame
   global.HTMLElement = window.HTMLElement

   // Set the document body.
   window.document.body.innerHTML = `
     <ol d-state="{ array: ['Value A', 'Value B', 'Value C', 'Value D'] }">
       <template d-for="(value, index) of array">
         <li d-text="index"></li>
       </template>
     </ol>
   `

   // Create and enable Doars.
   const doars = new Doars({
     root: window.document.body,
   })
   doars.enable()

   // Wait.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Assert.
   const lis = window.document.querySelectorAll('li')
   expect(lis.length).toBe(4)
   expect(lis[0].textContent).toBe('0')
   expect(lis[1].textContent).toBe('1')
   expect(lis[2].textContent).toBe('2')
   expect(lis[3].textContent).toBe('3')
})

test('for directive should iterate over promise number', async () => {
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
    <ol d-state="{}">
      <template d-for="index of resolveInTime(4)">
        <li d-text="index"></li>
      </template>
    </ol>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 10))

  // Assert.
  const lis = window.document.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('0')
  expect(lis[1].textContent).toBe('1')
  expect(lis[2].textContent).toBe('2')
  expect(lis[3].textContent).toBe('3')
})

test('for directive should iterate over object values', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
      <template d-for="(key, value) in object">
        <li d-text="value"></li>
      </template>
    </ul>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const lis = window.document.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('Value A')
  expect(lis[1].textContent).toBe('Value B')
  expect(lis[2].textContent).toBe('Value C')
  expect(lis[3].textContent).toBe('Value D')
})

test('for directive should iterate over object keys', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
      <template d-for="key in object">
        <li d-text="key"></li>
      </template>
    </ul>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const lis = window.document.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('a')
  expect(lis[1].textContent).toBe('b')
  expect(lis[2].textContent).toBe('c')
  expect(lis[3].textContent).toBe('d')
})

test('for directive should iterate over string with index', async () => {
   // Create a new window.
   const window = new Window()

   // Set globals for Doars
   global.document = window.document
   global.MutationObserver = window.MutationObserver
   global.requestAnimationFrame = window.requestAnimationFrame
   global.HTMLElement = window.HTMLElement

   // Set the document body.
   window.document.body.innerHTML = `
     <ol d-state="{}">
       <template d-for="(value, index) of 'text'">
         <li d-text="index"></li>
       </template>
     </ol>
   `

   // Create and enable Doars.
   const doars = new Doars({
     root: window.document.body,
   })
   doars.enable()

   // Wait.
   await new Promise(resolve => setTimeout(resolve, 10))

   // Assert.
   const lis = window.document.querySelectorAll('li')
   expect(lis.length).toBe(4)
   expect(lis[0].textContent).toBe('0')
   expect(lis[1].textContent).toBe('1')
   expect(lis[2].textContent).toBe('2')
   expect(lis[3].textContent).toBe('3')
})

test('for directive should iterate over object with index', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <ul d-state="{ object: { a: 'Value A', b: 'Value B', c: 'Value C', d: 'Value D' } }">
      <template d-for="(key, value) in object">
        <li d-text="key"></li>
      </template>
    </ul>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const lis = window.document.querySelectorAll('li')
  expect(lis.length).toBe(4)
  expect(lis[0].textContent).toBe('a')
  expect(lis[1].textContent).toBe('b')
  expect(lis[2].textContent).toBe('c')
  expect(lis[3].textContent).toBe('d')
})
