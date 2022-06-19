// Import symbols.
import { FETCH } from '../symbols.js'

export default ({ defaultInit, encodingConverters }) => {
  return {
    name: 'fetch',

    update: (component, attribute, { processExpression }) => {
      // TODO: Add most modifiers from 'on' directive, such as delay, prevent, and once.
      // TODO: Add delete, get, patch, post, and put modifiers.
      // TODO: Add inner, outer, inner-append, outer-append, inner-prepend, outer-prepend, morph modifiers.
      // TODO: Add reference modifier whose first part is the keyword and the second part the name of the reference key. Only available in combination with the inner or outer modifier.
      // TODO: Add encoding modifier whose first part is the keyword and the second part the name of the encoding type.

      // TODO: Auto listen to click events on buttons if no event is specified.
      // TODO: Auto listen to submit events on forms if no event is specified.
      // TODO: Handle enctype attribute on form.
      // TODO: Handle form validation. Take required and pattern attributes into account.
      // TODO: Handle input type form.
      // TODO: Use method attribute on form if related modifier is not used.
      // TODO: Use action attribute on form if no attribute value is specified.

      // TODO: Dispatch d-fetch event on element.
      // TODO: Dispatch d-fetch-error event on element when a fetch error occurs.
      // TODO: Dispatch d-fetch-invalid event on element when form validation fails.
    },
  }
}
