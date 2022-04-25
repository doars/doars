/**
 * Escape slashes, quotation marks, and new lines.
 * @param {String} text String to escape.
 * @returns {String} Escaped string.
 */
export const escapeHtml = (text) => {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\'/g, '\\\'')
    .replace(/\"/g, '\\"')
    .replace(/\n/g, '\\n')
}

/**
 * Convert a string from kebab-case to camelCase.
 * @param {String} text String to modify.
 * @returns {String} Converted string.
 */
export const kebabToCamel = (text) => {
  return text.replace(/-(\w)/g, (match, character) => character.toUpperCase())
}

/**
 * Parse list of modifiers to an object.
 * - [ 'hello', 'there-100', 'general-kenobi' ]
 *    -> { 'hello': true, 'there': 100, 'general': 'kenobi' }
 * @param {Array<String>} modifiers List of modifiers to parse.
 * @returns {Object} Parsed modifiers.
 */
export const parseAttributeModifiers = (modifiers) => {
  const result = {}
  for (const modifier of modifiers) {
    // Get index of hyphen.
    const hyphenIndex = modifier.indexOf('-')

    // If no hyphen then set the modifiers to true.
    if (hyphenIndex < 0) {
      result[modifier] = true
      continue
    }

    // If it starts with hyphen then set the modifier to false.
    if (hyphenIndex === 0) {
      result[modifier.substring(1)] = false
      continue
    }

    // If the hyphen is somewhere in the modifier then assume it is used as a split character.
    const key = modifier.substring(0, hyphenIndex)
    let value = modifier.substring(hyphenIndex + 1)

    let tmpValue = value

    // Try to remove time suffixes.
    let type
    if (value.endsWith('ms')) {
      tmpValue = value.substring(-2)
    } else if (value.endsWith('s')) {
      type = 's'
      tmpValue = value.substring(-1)
    } else if (value.endsWith('m')) {
      type = 'm'
      tmpValue = value.substring(-1)
    } else if (value.endsWith('h')) {
      type = 'h'
      tmpValue = value.substring(-1)
    }

    // Try to parse the value as a number.
    tmpValue = Number.parseInt(tmpValue)
    if (!isNaN(tmpValue)) {
      value = tmpValue

      // Convert to milliseconds if given in a different format.
      switch (type) {
        case 'h':
          value *= 60
        case 'm':
          value *= 60
        case 's':
          value *= 1000
          break
      }
    }

    // Store modifier data.
    result[key] = value
  }

  return result
}

/**
 * Parse attribute name to list of segments.
 * Valid formats are:
 * - "d-directive"
 *    -> [ 'directive', null, null, null ]
 * - "d-directive:key"
 *    -> [ 'directive', 'key', 'key', null ]
 * - "d-directive:key-name"
 *    -> [ 'directive', 'key-name', 'keyName', null ]
 * - "d-directive:key-name.modifiers"
 *    -> [ 'directive', 'key-name', 'keyName', [ 'modifiers' ] ]
 * - "d-directive.modifiers.multiple"
 *    -> [ 'directive', null, null, [ 'modifiers', 'multiple' ] ]
 * @param {String} name Name to parse.
 * @returns {Array<String>} list of segments.
 */
export const parseAttributeName = (prefix, name) => {
  // Match with expression.
  name = name.match(new RegExp('^' + prefix + '-([a-z][0-9a-z-]{1,}):?([a-z][0-9a-z-]*)?(\\..*]*)?$', 'i'))
  if (!name) {
    return
  }
  // Deconstruct match.
  let [full, directive, keyRaw, modifiers] = name // eslint-disable-line no-unused-vars
  // If no key provided set it to null instead of empty.
  keyRaw = keyRaw !== '' ? keyRaw : null
  const key = keyRaw ? kebabToCamel(keyRaw) : null
  // Ensure modifiers is and array.
  modifiers = modifiers ? modifiers.substring(1).split('.') : []
  // Return result a single array.
  return [directive, keyRaw, key, modifiers]
}

/**
 * Parses for expression. Valid expression formats are:
 * - "index of 4"
 *    -> { iterable: "4", variables: [ "index" ] }
 * - "item of items"
 *    -> { iterable: "items", variables: [ "item" ] }
 * - "key in object"
 *    -> { iterable: "object", variables: [ "key" ] }
 * - "(key, value) in object"
 *    -> { iterable: "object", variables: [ "key", "value" ] }
 * - "(key, value, index) in object"
 *    -> { iterable: "object", variables: [ "key", "value", "index" ] }
 * - "(key, , index) in object"
 *    -> { iterable: "object", variables: [ "key", undefined, "index" ] }
 */
export const parseForExpression = (expression) => {
  // Split variables from items expression.
  const match = expression.match(/^([$_a-z0-9,(){}\s]{1,}?)\s+(?:in|of)\s+([\s\S]{1,})$/i)
  if (!match) {
    return
  }

  // Remove parenthesis.
  let variables = match[1].replace(/^[\s({]*|[)}\s]*$/g, '')
  // Parse for variables.
  variables = variables.match(/^([$_a-z0-9]{1,})?(?:,\s+?)?([$_a-z0-9]{1,})?(?:,\s+)?([$_a-z0-9]{1,})?$/i)
  if (!variables) {
    return
  }
  variables.shift()
  return {
    iterable: match[2].trim(),
    variables: [...variables], // Convert it to an array instead of a regular expression match.
  }
}

/**
 * Parse selector to an attributes object.
 * @param {String} selector Selector to parse.
 * @returns {Object} Attributes. Do note the class property is a list of strings not a single string.
 */
export const parseSelector = (selector) => {
  // Convert to array.
  if (typeof (selector) === 'string') {
    selector = selector.split(/(?=\.)|(?=#)|(?=\[)/)
  }

  if (!Array.isArray(selector)) {
    console.error('Doars: parseSelector expects Array of string or a single string.')
    return
  }

  const attributes = {}
  for (let selectorSegment of selector) {
    // Trim spaces.
    selectorSegment = selectorSegment.trim()

    // Base what to do of the leading character.
    switch (selectorSegment[0]) {
      case '#':
        // Remove leading character and store as id.
        attributes.id = selectorSegment.substring(1)
        break

      case '.':
        // Remove leading character.
        selectorSegment = selectorSegment.substring(1)
        // Add to classlist.
        if (!attributes.class) {
          attributes.class = []
        }
        if (!attributes.class.includes(selectorSegment)) {
          attributes.class.push(selectorSegment)
        }
        break

      case '[':
        // Remove brackets and split key from value.
        const [full, key, value] = selectorSegment.match(/^(?:\[)?([-$_.a-z0-9]{1,})(?:[$*^])?(?:=)?([\s\S]{0,})(?:\])$/i) // eslint-disable-line no-unused-vars
        // Store attribute value in results.
        attributes[key] = value
        break
    }
  }
  return attributes
}

export default {
  escapeHtml: escapeHtml,
  kebabToCamel: kebabToCamel,
  parseAttributeModifiers: parseAttributeModifiers,
  parseAttributeName: parseAttributeName,
  parseForExpression: parseForExpression,
  parseSelector: parseSelector,
}
