// Import symbols.
import { ROUTE } from '../symbols.js'

// Import utils.
import { closestRouter } from '../utils.js'
import { insertAfter } from '@doars/doars/src/utils/ElementUtils.js'

export default {
  name: 'route',

  update: (component, attribute, { transitionIn, transitionOut }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()

    let router
    const setup = () => {
      // Stop listening to router and remove it.
      if (router && attribute[ROUTE]) {
        router.removeEventListener('changed', attribute[ROUTE].handler)
        router.removeEventListener('destroyed', attribute[ROUTE].setup)

        delete attribute[ROUTE]
      }

      // Get closest router in parent nodes.
      router = closestRouter(element)
      if (!router) {
        console.warn('DoarsRouter: Router not found for route.')
        return
      }

      // Setup route data.
      attribute[ROUTE] = {
        setup: setup,
      }

      // Deconstruct attribute.
      const value = attribute.getValue()

      // Add route to router.
      router.addRoute(value)

      // Handle router changes.
      const handleChange = (router, route) => {
        if (route !== value) {
          if (element.tagName === 'TEMPLATE') {
            if (attribute[ROUTE] && attribute[ROUTE].element) {
              // Transition out.
              const routeElement = attribute[ROUTE].element
              transitionOut(component, routeElement, () => {
                // Remove node.
                routeElement.remove()
                attribute[ROUTE].element = undefined
              })
            }
          } else {
            // Transition out and set display none.
            transitionOut(component, element, () => {
              element.style.display = 'none'
            })
          }
        } else if (element.tagName === 'TEMPLATE') {
          // Create new element from template.
          const templateInstance = document.importNode(element.content, true)
          // Add element after the template element.
          insertAfter(element, templateInstance)
          // Get HTMLElement reference instead of DocumentFragment.
          attribute[ROUTE].element = element.nextSibling

          // Transition in.
          transitionIn(component, attribute[ROUTE].element)
        } else {
          // Remove display none.
          element.style.display = null

          // Transition in.
          transitionIn(component, element)
        }
      }
      attribute[ROUTE].handler = handleChange

      // Listen to router changes and perform initial run.
      router.addEventListener('changed', handleChange)
      handleChange({ route: router.getRoute() })

      // If the router is destroyed look for another
      router.addEventListener('destroyed', setup)
    }

    // Perform initial setup.
    setup()
  },

  destroy: (component, attribute, { transitionOut }) => {
    // Deconstruct attribute.
    const element = attribute.getElement()
    if (element.tagName === 'TEMPLATE') {
      if (attribute[ROUTE] && attribute[ROUTE].element) {
        // Transition out.
        const routeElement = attribute[ROUTE].element
        transitionOut(component, routeElement, () => {
          // Remove node.
          routeElement.remove()
          attribute[ROUTE].element = undefined
        })
      }
    } else {
      // Transition out and set display none.
      transitionOut(component, element, () => {
        element.style.display = 'none'
      })
    }

    // Get closest router in parent nodes.
    const router = closestRouter(element)
    if (!router) {
      return
    }

    // Remove router listeners.
    if (attribute[ROUTE]) {
      router.removeEventListener('destroyed', attribute[ROUTE].setup)
      if (attribute[ROUTE].handler) {
        router.removeEventListener('change', attribute[ROUTE].handler)
      }
    }
  },
}
