import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

test('store context should share data across components', async () => {
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
      <input type="text" d-on:input="$store.message = $event.target.value">
      <div d-text="$store.message">Initial</div>
    </div>
  `

  // Create and enable Doars with initial store.
  const doars = new Doars({
    root: window.document.body,
    storeContextInitial: {
      message: 'Before',
    },
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial.
  const div = window.document.querySelector('div[d-text]')
  expect(div.textContent).toBe('Before')

  // Simulate input.
  const input = window.document.querySelector('input')
  input.value = 'After'
  input.dispatchEvent(new window.Event('input', { bubbles: true }))

  // Wait for update.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert updated.
  expect(div.textContent).toBe('After')
})

test('element context should provide element reference', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ tag: '' }" d-initialized="$state.tag = $element.tagName">
      <span d-text="$state.tag"></span>
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
  expect(span.textContent).toBe('DIV')
})

test('children context should list child components', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ count: '0' }" d-initialized="$state.count = $children.length.toString()">
      Children found: <span d-text="$state.count">Initial</span>

      <div d-state="{}"></div>
      <div d-state="{}"></div>
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
  expect(span.textContent).toBe('2')
})

test('component context should provide component instance', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ hasComponent: false }" d-initialized="$state.hasComponent = !!$component">
      <span d-text="$state.hasComponent ? 'true' : 'false'"></span>
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
  expect(span.textContent).toBe('true')
})

test('nextSibling context should access next component', async () => {
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
      <div d-state="{}"></div>
      <div d-state="{}"></div>
      <div d-state="{ nextMessage: '' }" d-initialized="$state.nextMessage = $nextSibling.$state.message">
        <span d-text="$state.nextMessage"></span>
      </div>
      <div d-state="{ message: 'success' }"></div>
      <div d-state="{}"></div>
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
  expect(span.textContent).toBe('success')
})

test('inContext should execute function in component context', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'General Kenobi.', logged: '' }" d-initialized="$inContext(({ $state }) => { $state.logged = $state.message })">
      <span d-text="$state.logged"></span>
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
  expect(span.textContent).toBe('General Kenobi.')
})

test('child context should access specific child component', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'Hello there' }">
      Child message: <span d-text="$children[0].$state.message">Initial</span>

      <div d-state="{ message: 'General Kenobi' }"></div>
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
  expect(span.textContent).toBe('General Kenobi')
})

test('previousSibling context should access previous component', async () => {
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
      <div d-state="{}"></div>
      <div d-state="{ message: 'success' }"></div>
      <div d-state="{ prevMessage: '' }" d-initialized="$state.prevMessage = $previousSibling.$state.message">
        <span d-text="$state.prevMessage"></span>
      </div>
      <div d-state="{}"></div>
      <div d-state="{}"></div>
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
  expect(span.textContent).toBe('success')
})

test('references context should provide referenced elements', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ refCount: '0' }" d-initialized="$state.refCount = Object.keys($references).length.toString()">
      <span d-text="$state.refCount"></span>
      <input d-reference="'myInput'">
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
  expect(span.textContent).toBe('1')
})

test('state log context should execute function', async () => {
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

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('logState', function(state) {
    captured.logged = state.test
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ test: 'value' }" d-initialized="logState($state)"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert function was called and captured the specific value.
  expect(captured.logged).toBe('value')
})

test('store log context should execute function', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Create Doars with store.
  const doars = new Doars({
    root: window.document.body,
    storeContextInitial: { test: 'value' },
  })

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('logStore', function(store) {
    captured.logged = store.test
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}" d-initialized="logStore($store)"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert function was called and captured the specific value.
  expect(captured.logged).toBe('value')
})

test('siblings context should provide sibling components', async () => {
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

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('collectSiblings', function(siblings) {
    captured.messages = siblings.map(s => s.$state.message).filter(Boolean)
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-state="{ message: 'first' }"></div>
      <div d-state="{ message: 'previous' }"></div>
      <div d-state="{}" d-initialized="collectSiblings($siblings)"></div>
      <div d-state="{ message: 'next' }"></div>
      <div d-state="{ message: 'last' }"></div>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert siblings captured.
  expect(captured.messages).toEqual(['first', 'previous', 'next', 'last'])
})

test('nextTick context should defer execution', async () => {
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

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('setTicked', function() {
    captured.ticked = true
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}" d-initialized="$nextTick(() => setTicked())"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert nextTick executed.
  expect(captured.ticked).toBe(true)
})

test('watch immediate context should trigger immediately', async () => {
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

  // Local state for the test.
  const captured = {}

  // Set simple context with closure.
  doars.setSimpleContext('setWatched', function() {
    captured.watched = true
  })

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ count: 0 }" d-initialized="$watch('count', () => setWatched(), { immediate: true })()"></div>
  `

  // Enable Doars.
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert watch triggered immediately.
  expect(captured.watched).toBe(true)
})