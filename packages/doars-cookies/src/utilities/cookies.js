// Cookie cache.
let _cookies = null
export const getAll = (
) => {
  if (_cookies === null) {
    // Get and parse cookies.
    _cookies = Object.fromEntries(
      document.cookie.split(/; */)
        .map(cookie => {
          const [key, ...value] = cookie.split('=')
          return [key, decodeURIComponent(value.join('='))]
        })
    )
  }
  return _cookies
}

export const set = (
  name,
  value = '',
  days = 60,
) => {
  name = name.trim()

  if (!value || value === '') {
    // Set cookie in document as expired.
    document.cookie = name + '=; Expires=Thu, 01 Jan 1970 00:00:01 GMT; Path=/; SameSite=Strict;'

    // Delete from cache as well.
    if (_cookies !== null) {
      // Ensure cache exists.
      delete _cookies[name]
    }
  } else {
    // Set cookie in document.
    let expires = ''
    if (days) {
      const date = new Date();
      date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000))
      expires = '; expires=' + date.toUTCString()
    }
    document.cookie = name + '=' + encodeURIComponent(value) + expires + '; Path=/; SameSite=Strict;'

    // Ensure the cache is populated.
    getAll()
    // Set in cache as well.
    _cookies[name] = value
  }
}
