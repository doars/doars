// Import renderer.
import { render as r } from '../utils/RenderUtils.js'

export default function () {
  return r('span', {
    'aria-hidden': true,
  }, [
    '૮ ˵･ﻌ･',
    // Flip the last character around.
    r('div', {
      style: 'display:inline-block;transform:scaleX(-1)',
    }, '૮'),
  ])
}
