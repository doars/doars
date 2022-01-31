export default (options) => {
  // Overwrite default options.
  options = Object.assign({
    defaultOrder: 500,
  }, options)

  // Create list of update directives.
  const itemIds = []
  const items = []

  const directive = {
    name: 'update',

    update: function (component, attribute, { executeExpression }) {
      // Store execute expression locally.
      if (!this._execute) {
        this._execute = executeExpression
      }

      // Deconstruct attribute.
      const id = attribute.getId()

      // Exit early if already in list.
      if (itemIds.indexOf(id) >= 0) {
        return
      }

      // Deconstruct attribute.
      let { order } = attribute.getModifiers()
      if (!order) {
        order = options.defaultOrder
      }

      // Get index to place item at based on order.
      let index = 0
      for (let i = 0; i < items.length; i++) {
        if (items[i].order >= order) {
          index = i
          break
        }
      }

      // Add item at index in list.
      items.splice(index, 0, {
        attribute: attribute,
        component: component,
        order: order,
      })
    },

    destroy: (component, attribute) => {
      // Deconstruct attribute.
      const id = attribute.getId()

      // Exit early if already in list.
      const index = itemIds.indexOf(id)
      if (index >= 0) {
        return
      }

      // Remove attribute id from item ids list.
      itemIds.splice(index, 1)

      // Remove attribute from items list.
      for (let i = 0; i < items.length; i++) {
        if (items[i].attribute === attribute) {
          // Remove item from list.
          items.splice(i, 1)
          break
        }
      }
    },
  }

  return [directive, () => {
    // Run expression of each item in order.
    for (const item of items) {
      directive._execute(item.component, item.attribute.clone(), item.attribute.getValue(), {}, { return: false })
    }
  }]
}
