import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

test('text directive should set text content', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body to the example HTML.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <span d-text="'&lt;h1&gt;After&lt;/h1&gt;'">
        Before
      </span>
    </div>
  `

  // Create a Doars instance.
  const doars = new Doars({
    root: window.document.body,
  })

  // Enable Doars.
  doars.enable()

  // Wait for directives to process.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert the text content.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('<h1>After</h1>')
})

test('show directive should show element when true', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="true" style="display: none;">
        Hello world!
      </div>
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
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('show directive should hide element when false', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{}">
      <div d-show="false">
        Hello world!
      </div>
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
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('none')
})

test('html directive should set innerHTML', async () => {
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
      <span d-html="'<h1>After</h1>'">
        Before
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
  expect(span.innerHTML).toBe('<h1>After</h1>')
})

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

test('if directive should conditionally render', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ a: true, b: false }">
      <template d-if="a">
        <span>
          Should be visible
        </span>
      </template>

      <template d-if="b">
        <span>
          Should NOT be visible
        </span>
      </template>
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
  const visibleSpan = window.document.querySelector('span')
  expect(visibleSpan.textContent.trim()).toBe('Should be visible')

  const notVisibleSpans = window.document.querySelectorAll('span')
  expect(notVisibleSpans.length).toBe(1)
})

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
    <ol d-state="{ array: [ 'Value A', 'Value B', 'Value C', 'Value D' ] }">
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



test('sync directive should synchronize state and input', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'After' }">
      <input type="text" d-sync:state="message" value="Initial">

      <div d-text="message">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const input = window.document.querySelector('input')
  const div = window.document.querySelector('div[d-text]')
  expect(input.value).toBe('After')
  expect(div.textContent).toBe('After')
})

test('sync store directive should synchronize store and input', async () => {
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
      <input type="text" d-sync:store="message" value="Initial">

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

  // Assert initial sync.
  const input = window.document.querySelector('input')
  const div = window.document.querySelector('div[d-text]')
  expect(input.value).toBe('Before')
  expect(div.textContent).toBe('Before')
})

test('sync state directive should synchronize state and textarea', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'After' }">
      <textarea d-sync:state="message">Initial</textarea>

      <div d-text="message">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const textarea = window.document.querySelector('textarea')
  const div = window.document.querySelector('div[d-text]')
  expect(textarea.value).toBe('After')
  expect(div.textContent).toBe('After')
})

test('sync state directive should synchronize state and checkboxes', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ selected: ['after'] }">
      <input type="checkbox" d-sync:state="selected" value="before" checked>
      <input type="checkbox" d-sync:state="selected" value="after">

      <div d-text="selected.join(', ')">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const checkboxes = window.document.querySelectorAll('input[type="checkbox"]')
  const div = window.document.querySelector('div[d-text]')
  expect(checkboxes[0].checked).toBe(false)
  expect(checkboxes[1].checked).toBe(true)
  expect(div.textContent).toBe('after')
})

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

test('sync state directive should synchronize state and radios', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ selected: 'before' }">
      <input type="radio" d-sync:state="selected" value="initial" checked>
      <input type="radio" d-sync:state="selected" value="before">
      <input type="radio" d-sync:state="selected" value="after">

      <div d-text="selected">Initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const radios = window.document.querySelectorAll('input[type="radio"]')
  const div = window.document.querySelector('div[d-text]')
  expect(radios[0].checked).toBe(false)
  expect(radios[1].checked).toBe(true)
  expect(radios[2].checked).toBe(false)
  expect(div.textContent).toBe('before')
})

test('html directive should decode HTML entities', async () => {
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
      <span d-html.decode="'&lt;h1&gt;After&lt;/h1&gt;'">
        Before
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

  // Assert decoded HTML.
  const span = window.document.querySelector('span')
  expect(span.innerHTML).toBe('<h1>After</h1>')
})

test('text directive should handle promises', async () => {
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
      <span d-text="resolveInTime('<h1>After</h1>')">
        Before
      </span>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert text set.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('<h1>After</h1>')
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

test('initialized directive should run on component init', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ init: false }" d-initialized="$state.init = true">
      <span d-text="$state.init ? 'true' : 'false'"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initialized.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})

test('sync state directive should synchronize state and select', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ selected: 'before' }">
      <select d-sync:state="selected">
        <option value="initial" selected>Initial</option>
        <option value="before">Before</option>
        <option value="after">After</option>
      </select>

      <div d-text="selected">initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const select = window.document.querySelector('select')
  const div = window.document.querySelector('div[d-text]')
  expect(select.value).toBe('before')
  expect(div.textContent).toBe('before')
})

test('show directive should hide element when false', async () => {
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
      <div d-show="false">
        Hello world!
      </div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert hidden.
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('none')
})

test('html directive should morph HTML structure', async () => {
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
      <span d-html.morph="'<h1>After</h1>'">
        <span>
          Before
        </span>
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

  // Assert morphed HTML.
  const span = window.document.querySelector('span')
  expect(span.innerHTML.trim()).toBe('<h1>After</h1>')
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

test('show directive should handle promises', async () => {
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
      <div d-show="resolveInTime(true)" style="display: none;">
        Hello world!
      </div>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert shown.
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('sync state directive should synchronize state and select multiple', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ selected: ['before', 'before2'] }">
      <select d-sync:state="selected" multiple>
        <option value="initial" selected>Initial</option>
        <option value="before">Before</option>
        <option value="before2">Before2</option>
        <option value="after">After</option>
      </select>

      <div d-text="selected.join(', ')">initial</div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial sync.
  const select = window.document.querySelector('select')
  const selected = Array.from(select.selectedOptions).map(o => o.value)
  const div = window.document.querySelector('div[d-text]')
  expect(selected).toEqual(['before', 'before2'])
  expect(div.textContent).toBe('before, before2')
})

test('html directive should handle promises', async () => {
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
      <span d-html="resolveInTime('<h1>After</h1>')">
        Before
      </span>
    </div>
  `

  // Enable Doars.
  doars.enable()

  // Wait for promise.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert HTML set.
  const span = window.document.querySelector('span')
  expect(span.innerHTML).toBe('<h1>After</h1>')
})

test('state directive should initialize and assign values', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ message: 'Hello there!' }" d-initialized="$state.message = 'General Kenobi.'">
      <span d-text="message"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert assigned.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('General Kenobi.')
})

test('attribute directive should overwrite style properties', async () => {
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
      <span style="background-color: yellow;" d-attribute:style="{ 'background-color': 'red' }">
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

  // Assert style overwritten.
  const span = window.document.querySelector('span')
  expect(span.style.backgroundColor).toBe('red')
})

test('show directive should handle transitions on show', async () => {
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
      <div d-show="true" style="display: none;" d-transition:in=".transition" d-transition:in.from=".opacity-0"
        d-transition:in.to=".opacity-1">
        Hello world!
      </div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert shown.
  const div = window.document.querySelector('div[d-show]')
  expect(div.style.display).toBe('')
})

test('state directive should handle empty state', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="" d-initialized="$state.test = true">
      <span d-text="$state.test ? 'true' : 'false'"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert empty state works.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})









test('ignore directive should prevent processing inside', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div>
      <!-- Outside any component. -->
      <div d-ignore>
        <div d-state="{}">
          <span d-text="'Should not be seen'">
            Should not change
          </span>
        </div>
      </div>

      <!-- Inside a component. -->
      <div d-state="{}">
        <div d-ignore>
          <span d-text="'Should not be seen'">
            Should not change
          </span>
        </div>
      </div>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert spans not changed.
  const spans = window.document.querySelectorAll('span')
  expect(spans[0].textContent.trim()).toBe('Should not change')
  expect(spans[1].textContent.trim()).toBe('Should not change')
})

test('on click once directive should fire only once', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ clicked: 'false' }">
      <button d-on:click.once="$state.clicked = 'true'">
        Click
      </button>
      <span d-text="$state.clicked"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Click twice.
  const button = window.document.querySelector('button')
  button.click()
  await new Promise(resolve => setTimeout(resolve, 0))
  button.click()
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert clicked once.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})

test('cloak directive should remove cloak attribute', async () => {
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
      Does cloaking work?

      <span d-cloak>
        Yes!
      </span>
    </div>
  `

  // Add CSS for cloak.
  const style = window.document.createElement('style')
  style.textContent = '[d-cloak] { display: none; }'
  window.document.head.appendChild(style)

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert cloak is removed.
  const span = window.document.querySelector('span')
  expect(span.hasAttribute('d-cloak')).toBe(false)
})

test('on click directive should handle click events', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ clicked: 'false' }">
      <button d-on:click="$state.clicked = 'true'">
        Click
      </button>
      <span d-text="$state.clicked">false</span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert initial text.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('false')

  // Simulate click.
  const button = window.document.querySelector('button')
  button.click()

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert text changed.
  expect(span.textContent).toBe('true')
})

test('on keydown directive should handle key events', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ key: '' }">
      <input type="text" d-on:keydown="$state.key = $event.key">
      <span d-text="$state.key"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Simulate keydown.
  const input = window.document.querySelector('input')
  const event = new window.KeyboardEvent('keydown', { key: 'a' })
  input.dispatchEvent(event)

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert key set.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('a')
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

test('on click outside directive handles outside clicks', async () => {
  // Create a new window.
  const window = new Window()

  // Set globals for Doars
  global.document = window.document
  global.MutationObserver = window.MutationObserver
  global.requestAnimationFrame = window.requestAnimationFrame
  global.HTMLElement = window.HTMLElement

  // Set the document body.
  window.document.body.innerHTML = `
    <div d-state="{ clicked: 'false' }">
      <button d-on:click.outside="$state.clicked = 'true'">
        Click
      </button>
      <span d-text="$state.clicked"></span>
    </div>
  `

  // Create and enable Doars.
  const doars = new Doars({
    root: window.document.body,
  })
  doars.enable()

  // Wait.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Click on body (outside button).
  window.document.body.click()

  // Wait for event.
  await new Promise(resolve => setTimeout(resolve, 0))

  // Assert.
  const span = window.document.querySelector('span')
  expect(span.textContent).toBe('true')
})