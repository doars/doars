export const parseResponse = (response, type) => {
  let promise
  switch (String.prototype.toLowerCase.call(type)) {
    default:
      console.warn('Unknown response type "' + type + '" used when using the $fetch context.')
      break

    case 'arraybuffer':
      promise = response.arrayBuffer()
      break

    case 'blob':
      promise = response.blob()
      break

    case 'formdata':
      promise = response.formData()
      break

    case 'json':
      promise = response.json()
      break

    // HTML and xml need to be converted to text before being able to be parsed.
    case 'element':
    case 'html':
    case 'svg':
    case 'text':
    case 'xml':
      promise = response.text()
      break
  }

  if (!promise) {
    return null
  }

  return promise
    .then((response) => {
      switch (type) {
        // Convert from html to HTMLElement inside a document fragment.
        case 'element':
          const template = document.createElement('template')
          template.innerHTML = response
          response = template.content.childNodes[0]
          break

        // Parse some values via the DOM parser.
        case 'html':
          response = (new DOMParser()).parseFromString(response, 'text/html')
          break
        case 'svg':
          response = (new DOMParser()).parseFromString(response, 'image/svg+xml')
          break
        case 'xml':
          response = (new DOMParser()).parseFromString(response, 'application/xml')
          break
      }

      return response
    })
}

export const responseType = (response) => {
  switch (String.prototype.toLowerCase(response.headers.get('content-type'))) {
    case 'text/html':
      return 'html'

    case 'application/json':
    case 'application/ld+json':
    case 'application/vnd.api+json':
      return 'json'

    case 'image/svg+xml':
      return 'svg'

    case 'text/plain':
      return 'text'

    case 'application/xml':
    case 'text/xml':
      return 'xml'
  }

  return null
}
