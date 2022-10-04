// Create and cache native promise for comparison.
const nativePromise = Function.prototype.toString.call(Function /* A native object */)
  .replace('Function', 'Promise') // Replace identifier.
  .replace(/\(.*\)/, '()') // Remove possible FormalParameterList.

export const isNativePromise = (value) => {
  return value && typeof value.constructor === 'function' && Function.prototype.toString.call(value.constructor).replace(/\(.*\)/, '()') === nativePromise
}

export const isPromise = (value) => {
  return value && Object.prototype.toString.call(value) === '[object Promise]'
}

export default {
  isPromise,
  isNativePromise,
}
