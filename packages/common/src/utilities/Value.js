export const isDeeply = (valueA, valueB) => {
  const typeA = typeof (valueA)
  // eslint-disable-next-line valid-typeof
  if (typeA !== typeof (valueB)) {
    return false
  }

  if (typeA === 'object') {
    if (Array.isArray(valueA)) {
      if (valueA.length !== valueB.length) {
        return false
      }

      for (let i = 0; i < valueA.length; i++) {
        if (valueA[i] !== valueB[i]) {
          return false
        }
      }
    } else {
      if (Object.keys(valueA).length !== Object.keys(valueB).length) {
        return false
      }

      // Check for each key.
      for (const key in valueA) {
        if (!(key in valueB)) {
          return false
        }

        if (typeof (valueA[key]) !== typeof (valueB)) {
          return false
        }

        if (!isDeeply(valueA[key], valueB[key])) {
          return false
        }
      }
    }
  } else if (valueA !== valueB) {
    return false
  }

  return true
}

export default {
  isDeeply,
}
