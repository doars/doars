// Import renderer.
import { render as r } from '../utils/RenderUtils.js'

/**
 *
 */
export default function () {
  return r('span', {
    'aria-hidden': true,
  }, [
    r('span', '૮ ˵･ﻌ･'),
    // Flip the last character around.
    r('span', {
      style: 'display:inline-block;transform:scale(-1, 1)',
    }, '૮'),
  ])
}
