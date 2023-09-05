export const getAll = (
) => {
  const data = {}
  const keys = Object.keys(localStorage)
  for (let i = keys.length - 1; i >= 0; i--) {
    data[keys[i]] = localStorage.getItem(keys[i])
  }
  return data
}
