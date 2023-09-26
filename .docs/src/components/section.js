// Import renderer.
import { render as r } from '../utils/RenderUtils.js'

/**
 *
 * @param {...any} contents
 */
export default function (...contents) {
  return r('section', {
    class: 'container px-2',
  }, contents)
}
