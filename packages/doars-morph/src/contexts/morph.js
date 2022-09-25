import { morphTree } from '@doars/common/src/utilities/Morph.js'

export default {
  name: '$morph',

  create: () => {
    return morphTree
  }
}
