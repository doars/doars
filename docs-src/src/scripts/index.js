import Doars from '@doars/doars'

/**
 * Setup doars instance.
 */
const setup = (
) => {
  (new Doars()).enable()
}

// Setup when document is ready.
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setup()
} else {
  document.addEventListener('DOMContentLoaded', setup, { once: true, passive: true })
}

/**
 * Set a piece of text to the devices clipboard.
 * @param {string} text Text to set in the clipboard.
 */
window.copyToClipboard = (text) => {
  // Create element and set content.
  const element = document.createElement('textarea')
  element.value = text
  document.body.append(element)

  // Select element's content.
  element.select()
  element.setSelectionRange(0, 999999)

  // Copy to clipboard.
  document.execCommand('copy')

  // Remove element.
  element.remove()
}

let count = 0
let element = document.getElementById('counter-text')
window.increment = () => {
  count++
  element.setAttribute('d-text', count)
}
