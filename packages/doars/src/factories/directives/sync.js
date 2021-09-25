// Import utils.
import { set } from '../../utils/ObjectUtils.js'

export default (symbol, getData, contextPrefix) => {
  const destroy = (component, attribute) => {
    // Exit early if nothing to destroy.
    if (!attribute[symbol]) {
      return
    }

    // Deconstruct attribute.
    const element = attribute.getElement()

    // Remove existing event listeners.
    element.removeEventListener('input', attribute[symbol])

    // Remove data from attribute.
    delete attribute[symbol]
  }

  return {
    update: (component, attribute, { executeExpression }) => {
      // Deconstruct attribute.
      const element = attribute.getElement()

      // Store whether this call is an update.
      const isNew = !attribute[symbol]

      if (isNew) {
        // Check if placed on a correct tag.
        if (!(element.tagName === 'DIV' && element.hasAttribute('contenteditable')) && element.tagName !== 'INPUT' && element.tagName !== 'SELECT' && element.tagName !== 'TEXTAREA') {
          console.warn('Doars: `sync` directive must be placed on an `<input>`, `<select>`, `<textarea>` tag, or a content editable `div`.')
          return
        }
      }

      // Deconstruct attribute.
      const value = attribute.getValue()

      // Check if value is a valid variable name.
      if (!/^[_$a-z]{1}[._$a-z0-9]{0,}$/i.test(value)) {
        destroy(component, attribute)
        console.warn('Doars: `sync` directive\'s value not a valid variable name: "' + value + '".')
        return
      }

      // Remove context prefix.
      let pathSplit = value
      if (pathSplit.startsWith(contextPrefix)) {
        pathSplit = pathSplit.substring(contextPrefix.length)
      }
      // Split value into path segments.
      pathSplit = pathSplit.split('.')

      if (isNew) {
        // Get data for syncing.
        const { data, id, path } = getData(component, attribute)

        // Set handler that updates data based of node tag.
        let handler
        switch (element.tagName) {
          case 'DIV':
            handler = () => {
              set(data, pathSplit, element.innerText)
              return true
            }
            break

          case 'INPUT':
            handler = () => {
              if (element.type === 'checkbox') {
                const dataValue = executeExpression(component, attribute.clone(), value)
                if (element.checked) {
                  if (!dataValue) {
                    set(data, pathSplit, [element.value])
                    return true
                  } if (!dataValue.includes(element.value)) {
                    dataValue.push(element.value)
                    return true
                  }
                } else if (dataValue) {
                  const index = dataValue.indexOf(element.value)
                  if (index >= 0) {
                    dataValue.splice(index, 1)
                    return true
                  }
                }
              } else if (element.type === 'radio') {
                const dataValue = executeExpression(component, attribute.clone(), value)
                if (element.checked) {
                  if (dataValue !== element.value) {
                    set(data, pathSplit, element.value)
                    return true
                  }
                } else if (dataValue === element.value) {
                  set(data, pathSplit, null)
                  return true
                }
              } else {
                set(data, pathSplit, element.value)
                return true
              }
              return false
            }
            break

          case 'TEXTAREA':
            handler = () => {
              set(data, pathSplit, element.value)
              return true
            }
            break

          case 'SELECT':
            handler = () => {
              if (element.multiple) {
                const values = []
                for (const option of element.selectedOptions) {
                  values.push(option.value)
                }
                set(data, pathSplit, values)
                return true
              }

              set(data, pathSplit, element.selectedOptions[0].value)
              return true
            }
            break
        }

        // Wrap handler so an update is triggered.
        const handlerWrapper = () => {
          // Call handler.
          if (handler()) {
            // Dispatch update trigger.
            component.getLibrary().update([{
              id: id,
              path: path,
            }])
          }
        }

        // Add event listener.
        element.addEventListener('input', handlerWrapper)

        // Store handler wrapper.
        attribute[symbol] = handlerWrapper
      }

      const dataValue = executeExpression(component, attribute, value)
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
          } else if (dataValue !== element.value) { // Check if current value is different than attribute value.
            // Update current value.
            element.setAttribute('value', dataValue)
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

    destroy: destroy,
  }
}
