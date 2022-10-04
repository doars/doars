const DECODE_LOOKUP = {
  '&amp;': '&',
  '&#38;': '&',
  '&lt;': '<',
  '&#60;': '<',
  '&gt;': '>',
  '&#62;': '>',
  '&apos;': '\'',
  '&#39;': '\'',
  '&quot;': '"',
  '&#34;': '"',
}
const DECODE_REGEXP = /&(?:amp|#38|lt|#60|gt|#62|apos|#39|quot|#34);/g

const ENCODE_LOOKUP = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '\'': '&#39;',
  '"': '&quot;',
}
const ENCODE_REGEXP = /[&<>'"]/g

export const decode = (string) => {
  if (typeof (string) !== 'string') {
    return string
  }

  return string.replaceAll(DECODE_REGEXP, (character) => {
    return DECODE_LOOKUP[character]
  })
}

export const encode = (string) => {
  if (typeof (string) !== 'string') {
    return string
  }

  return string.replaceAll(ENCODE_REGEXP, (character) => {
    return ENCODE_LOOKUP[character]
  })
}

export default {
  decode,
  encode,
}
