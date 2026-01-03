import { describe, test, expect, beforeEach, afterEach } from 'bun:test'

// Import shared setup
import { document } from './test-setup.js'

// Import Doars
import Doars from '../../src/DoarsExecute.js'

describe('Mutations', () => {
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

  test('adding attribute to element triggers directive processing', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}">
        <span>Before</span>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial processing.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Get the component and span.
    const component = container.querySelector('[d-state]')
    const span = container.querySelector('span')

    // Add d-text attribute.
    span.setAttribute('d-text', "'After'")

    // Trigger update by changing state.
    component.setAttribute('d-state', '{ updated: true }')

    // Wait for mutation processing.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert text updated.
    expect(span.textContent).toBe('After')
  })

  test('adding component to DOM triggers processing', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div></div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial processing.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Get sub-container.
    const subContainer = container.children[0]

    // Add new component.
    const newComponent = document.createElement('div')
    newComponent.setAttribute('d-state', '{}')
    const span = document.createElement('span')
    span.setAttribute('d-text', "'Added'")
    newComponent.appendChild(span)
    subContainer.appendChild(newComponent)

    // Wait for mutation processing.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert new component processed.
    expect(span.textContent).toBe('Added')
  })

  test('adding element to component triggers directive processing', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{}"></div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial processing.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Get the component.
    const component = container.querySelector('[d-state]')

    // Add new element with directive.
    const span = document.createElement('span')
    span.setAttribute('d-text', "'Added'")
    component.appendChild(span)

    // Wait for mutation processing.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert element processed.
    expect(span.textContent).toBe('Added')
  })

  test('changing attribute value triggers directive re-processing', async () => {
    // Set the container HTML.
    container.innerHTML = `
    <div d-state="{}">
      <span d-text="'Before'">Initial</span>
    </div>
  `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial processing.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Get the span.
    const span = container.querySelector('span')

    // Change d-text attribute.
    span.setAttribute('d-text', "'After'")

    // Wait for mutation processing.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert text updated.
    expect(span.textContent).toBe('After')
  })

  test('changing d-state attribute does not trigger re-processing', async () => {
    // Set the container HTML.
    container.innerHTML = `
      <div d-state="{ message: 'Before' }">
        <span d-text="message">Initial</span>
      </div>
    `

    // Create and enable Doars.
    doars = new Doars({
      root: container,
    })
    doars.enable()

    // Wait for initial processing.
    await new Promise(resolve => setTimeout(resolve, 1))

    // Get the component and span.
    const component = container.querySelector('[d-state]')
    const span = container.querySelector('span')

    // Change d-state attribute.
    component.setAttribute('d-state', "{ message: 'After' }")

    // Wait for potential mutation processing.
    await new Promise(resolve => setTimeout(resolve, 100))

    // Assert text not updated (state change not handled).
    expect(span.textContent).toBe('Before')
  })
})
