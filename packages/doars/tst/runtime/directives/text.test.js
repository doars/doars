import { Window } from 'happy-dom'
import { test, expect } from 'bun:test'

// Import Doars
import Doars from '../../../src/DoarsExecute.js'

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

// TODO: Write a test that checks if numbers are correctly converted to a string, for example `0` needs to become `"0"` and not `""`.`

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
