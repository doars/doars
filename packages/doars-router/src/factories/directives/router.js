// Import router.
import Router from '../../Router.js'

// Import symbols.
import { ROUTER } from '../../symbols.js'

export default function (routerOptions) {
  return {
    name: 'router',

    update: (component, attribute, { executeExpression }) => {
      // Deconstruct attribute.
      const element = attribute.getElement()

      // Get router.
      let router = element[ROUTER]
      if (!router) {
        // Construct options.
        const options = Object.assign({}, routerOptions, executeExpression(component, attribute.clone(), attribute.getValue()))
        // Create router
        router = element[ROUTER] = new Router(options)
      }
    },

    destroy: (component, attribute) => {
      // Deconstruct attribute.
      const element = attribute.getElement()

      // Get router.
      const router = element[ROUTER]
      if (!router) {
        return
      }

      // Remove router reference.
      delete element[ROUTER]

      // Deconstruct router.
      const id = router.getId()

      // Destroy router.
      router.destroy()

      // Deconstruct component.
      const library = component.getLibrary()

      // Trigger update due to changed router.
      library.update([{ id: id, path: '' }])
    },
  }
}
