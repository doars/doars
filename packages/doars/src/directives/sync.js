// Import symbols.
import { SYNC } from '../symbols.js'
import { escapeHtml } from '@doars/utils/src/StringUtils.js'

export default {
  name: 'sync',

  update: (component, attribute, { processExpression }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    // Store whether this call is an update.
    const isNew = !attribute[SYNC]

    if (isNew) {
      // Check if placed on a valid tag.
      if (
        !(element.tagName === 'DIV' && element.hasAttribute('contenteditable'))
        && element.tagName !== 'INPUT'
        && element.tagName !== 'SELECT'
        && element.tagName !== 'TEXTAREA'
      ) {
        console.warn('Doars: `sync` directive must be placed on an `<input>`, `<select>`, `<textarea>` tag, or a content editable `div`.')
        return
      }
    }

    // Deconstruct attribute.
    let value = attribute.getValue().trim()
    const key = attribute.getKey()
    if (key) {
      value = '$' + key + '.' + value
    }

    // Check if value is a valid variable name.
    if (!/^[_$a-z]{1}[._$a-z0-9]{0,}$/i.test(value)) {
      console.warn('Doars: `sync` directive\'s value not a valid variable name: "' + value + '".')
      return
    }

    if (isNew) {
      // Set handler that updates data based of node tag.
      let handler
      switch (element.tagName) {
        case 'DIV':
          handler = () => {
            // Update value.
            processExpression(
              component,
              attribute.clone(),
              value + '=\'' + escapeHtml(element.innerText) + '\''
            )
          }
          break

        case 'INPUT':
          handler = () => {
            const attributeClone = attribute.clone()
            const elementValue = escapeHtml(element.value)

            if (element.type === 'checkbox') {
              // Get current value.
              const dataValue = processExpression(
                component,
                attributeClone,
                value
              )

              // Update value.
              if (element.checked) {
                if (!dataValue) {
                  processExpression(
                    component,
                    attributeClone,
                    value + '=[\'' + elementValue + '\']'
                  )
                } if (!dataValue.includes(element.value)) {
                  processExpression(
                    component,
                    attributeClone,
                    value + '.push(\'' + elementValue + '\')'
                  )
                }
              } else if (dataValue) {
                const index = dataValue.indexOf(element.value)
                if (index >= 0) {
                  processExpression(
                    component,
                    attributeClone,
                    value + '.splice(' + index + ',1)'
                  )
                }
              }
            } else if (element.type === 'radio') {
              const dataValue = processExpression(component, attributeClone, value)
              if (element.checked) {
                if (dataValue !== element.value) {
                  processExpression(
                    component,
                    attributeClone,
                    value + '=\'' + elementValue + '\''
                  )
                }
              } else if (dataValue === element.value) {
                processExpression(
                  component,
                  attributeClone,
                  value + '=null'
                )
              }
            } else {
              processExpression(
                component,
                attributeClone,
                value + '=\'' + elementValue + '\''
              )

            }
          }
          break

        case 'TEXTAREA':
          handler = () => {
            // Update value.
            processExpression(
              component,
              attribute.clone(),
              value + '=\'' + escapeHtml(element.value) + '\''
            )
          }
          break

        case 'SELECT':
          handler = () => {
            const attributeClone = attribute.clone()

            if (element.multiple) {
              const values = []
              for (const option of element.selectedOptions) {
                values.push(
                  escapeHtml(option.value)
                )
              }
              processExpression(
                component,
                attributeClone,
                value + '=[\'' + values.join('\',\'') + '\']'
              )
            } else {
              processExpression(
                component,
                attributeClone,
                value + '=\'' + escapeHtml(element.selectedOptions[0].value) + '\''
              )
            }
          }
          break
      }

      // Add event listener.
      element.addEventListener('input', handler)

      // Store handler wrapper.
      attribute[SYNC] = handler
    }

    const dataValue = processExpression(component, attribute, value)
    switch (element.tagName) {
      case 'DIV':
      case 'TEXTAREA':
        // Check if current value is different than attribute value.
        if (dataValue !== element.innerText) {
          // Update current value.
          element.innerText = dataValue
        }
        break

      case 'INPUT':
        if (element.type === 'checkbox') {
          // Update option if the checked value has changed.
          const checked = dataValue.includes(element.value)
          if (element.checked !== checked) {
            // Update checked value.
            element.checked = checked

            // Update checked attribute.
            if (checked) {
              element.setAttribute('checked', '')
            } else {
              element.removeAttribute('checked')
            }
          }
        } else if (element.type === 'radio') {
          // Update option if the checked value has changed.
          const checked = dataValue === element.value
          if (element.checked !== checked) {
            // Update checked value.
            element.checked = checked

            // Update checked attribute.
            if (checked) {
              element.setAttribute('checked', '')
            } else {
              element.removeAttribute('checked')
            }
          }
        } else {
          // Check if current value is different than attribute value.
          if (dataValue !== element.value) {
            // Update current value.
            element.setAttribute('value', dataValue)
          }
        }
        break

      case 'SELECT':
        // Iterate over the select options.
        for (const option of Array.from(element.options)) {
          // Update option if the selected value has changed.
          const select = Array.isArray(dataValue) ? dataValue.includes(option.value) : dataValue === option.value
          if (option.selected !== select) {
            // Update option status.
            option.selected = select

            // Update option attribute.
            if (select) {
              option.setAttribute('selected', '')
            } else {
              option.removeAttribute('selected')
            }
          }
        }
        break
    }
  },

  destroy: (component, attribute) => {
    // Exit early if nothing to destroy.
    if (!attribute[SYNC]) {
      return
    }

    // Deconstruct attribute.
    const element = attribute.getElement()

    // Remove existing event listeners.
    element.removeEventListener('input', attribute[SYNC])

    // Remove data from attribute.
    delete attribute[SYNC]
  }
}
