// Import utils.
import { isPromise } from '../utils/PromiseUtils.js'

export default {
  name: 'select',

  update: (component, attribute, { processExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    // Check if placed on a select tag.
    const type = element.getAttribute('type')
    if (element.tagName !== 'SELECT' && !(element.tagName === 'INPUT' && (type === 'checkbox' || type === 'radio'))) {
      console.warn('Doars: `select` directive must be placed on a `select` tag or `input` of type checkbox or radio.')
      return
    }

    const set = (data) => {
      // Iterate over the select options.
      if (element.tagName === 'SELECT') {
        for (const option of Array.from(element.options)) {
          // Update option if the selected value has changed.
          const select = Array.isArray(data) ? data.includes(option.value) : data === option.value
          if (option.selected !== select) {
            // Update option's status.
            option.selected = select

            // Update option's attribute.
            if (select) {
              option.setAttribute('selected', '')
            } else {
              option.removeAttribute('selected')
            }
          }
        }
      } else if (type === 'checkbox') {
        // Update option if the checked value has changed.
        const checked = data.includes(element.value)
        if (element.checked !== checked) {
          // Update checked attribute.
          if (checked) {
            element.setAttribute('checked', '')
          } else {
            element.removeAttribute('checked')
          }
        }
      } else {
        // Update option if the checked value has changed.
        const checked = data === element.value
        if (element.checked !== checked) {
          // Update checked attribute.
          if (checked) {
            element.setAttribute('checked', '')
          } else {
            element.removeAttribute('checked')
          }
        }
      }
    }

    // Execute attribute value.
    const result = processExpression(component, attribute, attribute.getValue())

    // Store results.
    attribute.setData(result)

    // Handle promises.
    if (isPromise(result)) {
      Promise.resolve(result)
        .then((resultResolved) => {
          // If stored data has changed then this promise should be ignored.
          if (attribute.getData() !== result) {
            return
          }

          set(resultResolved)
        })
    } else {
      set(result)
    }
  },
}
