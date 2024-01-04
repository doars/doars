export const getAll = (
) => {
  const data = {}
  const keys = Object.keys(sessionStorage)
  for (let i = keys.length - 1; i >= 0; i--) {
    data[keys[i]] = sessionStorage.getItem(keys[i])
  }
  return data
}
