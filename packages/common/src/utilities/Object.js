/**
 * Deeply assign a series of objects properties together.
 * @param {object} target Target object to merge to.
 * @param {...object} sources Objects to merge into the target.
 * @returns {object} Merged resulting object.
 */
export const deepAssign = (
  target,
  ...sources
) => {
  if (!sources.length) {
    return target
  }
  const source = sources.shift()

  if (isObject(target) && isObject(source)) {
    for (const key in source) {
      if (isObject(source[key])) {
        if (!target[key]) {
          Object.assign(target, {
            [key]: {},
          })
        }
        deepAssign(target[key], source[key])
      } else if (Array.isArray(source[key])) {
        target[key] = source[key].map((value) => {
          if (isObject(value)) {
            return deepAssign({}, value)
          }
          return value
        })
      } else {
        Object.assign(target, {
          [key]: source[key],
        })
      }
    }
  }

  return deepAssign(target, ...sources)
}

/**
 * Get value at path on object.
 * @param {object} object Object to get from.
 * @param  {Array<string>} path Path to value.
 * @returns {any} value at path.
 */
export const getDeeply = (
  object,
  path,
) => {
  let objectTemp = object
  let i = 0
  for (; i < path.length - 1; i++) {
    objectTemp = objectTemp[path[i]]
  }
  return objectTemp[path[i]]
}

/**
 * Check whether the value is an object.
 * @param {any} value Value of unknown type.
 * @returns {boolean} Whether the value is an object.
 */
export const isObject = (
  value,
) => {
  return (value && typeof value === 'object' && !Array.isArray(value))
}

/**
 * Set value on path at object.
 * @param {object} object Object to set on.
 * @param {Array<string>} path Path to value.
 * @param {any} value Value to set.
 */
export const setDeeply = (
  object,
  path,
  value,
) => {
  // Exit early if not an object.
  if (typeof (object) !== 'object') {
    return
  }

  let i = 0
  for (; i < path.length - 1; i++) {
    object = object[path[i]]

    // Exit early if not an object.
    if (typeof (object) !== 'object') {
      return
    }
  }
  object[path[i]] = value
}

export default {
  deepAssign,
  getDeeply,
  isObject,
  setDeeply,
}
