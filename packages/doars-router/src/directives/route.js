// Import utilities.
import closestRouter from '../utilities/closestRouter.js'
import {
  transitionIn,
  transitionOut,
} from '@doars/common/src/utilities/Transition.js'

const ROUTE = Symbol('ROUTE')

export default ({
  routeDirectiveName,
}) => ({
  name: routeDirectiveName,

  update: (
    component,
    attribute,
  ) => {
    // Deconstruct component and attribute.
    const libraryOptions = component.getLibrary().getOptions()
    const element = attribute.getElement()

    let router
    const setup = (
    ) => {
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
        setup,
      }

      // Deconstruct attribute.
      const value = attribute.getValue()

      // Add route to router.
      router.addRoute(value)

      // Handle router changes.
      const handleChange = (
        router,
        route,
      ) => {
        if (route !== value) {
          if (element.tagName === 'TEMPLATE') {
            if (attribute[ROUTE] && attribute[ROUTE].element) {
              // Transition out.
              const routeElement = attribute[ROUTE].element
              transitionOut(libraryOptions, routeElement, () => {
                // Remove node.
                routeElement.remove()
                attribute[ROUTE].element = undefined
              })
            }
          } else {
            // Transition out and set display none.
            transitionOut(libraryOptions, element, () => {
              element.style.display = 'none'
            })
          }
        } else if (element.tagName === 'TEMPLATE') {
          // Create new element from template.
          const templateInstance = document.importNode(element.content, true)
          // Add element after the template element.
          element.insertAdjacentElement('afterend', templateInstance)
          // Get HTMLElement reference instead of DocumentFragment.
          attribute[ROUTE].element = element.nextSibling

          // Transition in.
          transitionIn(libraryOptions, attribute[ROUTE].element)
        } else {
          // Remove display none.
          element.style.display = null

          // Transition in.
          transitionIn(libraryOptions, element)
        }
      }
      attribute[ROUTE].handler = handleChange

      // Listen to router changes and perform initial run.
      router.addEventListener('changed', handleChange)
      handleChange(router, router.getRoute())

      // If the router is destroyed look for another
      router.addEventListener('destroyed', setup)
    }

    // Perform initial setup.
    setup()
  },

  destroy: (
    component,
    attribute, {
      transitionOut,
    },
  ) => {
    const libraryOptions = component.getLibrary().getOptions()

    // Deconstruct attribute.
    const element = attribute.getElement()
    if (element.tagName === 'TEMPLATE') {
      if (attribute[ROUTE] && attribute[ROUTE].element) {
        // Transition out.
        const routeElement = attribute[ROUTE].element
        transitionOut(libraryOptions, routeElement, () => {
          // Remove node.
          routeElement.remove()
          attribute[ROUTE].element = undefined
        })
      }
    } else {
      // Transition out and set display none.
      transitionOut(libraryOptions, element, () => {
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
})
