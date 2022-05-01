// TODO: import { createContexts } from './ContextUtils.js'

/*
TODO: Parse expression and lookup on context instead of executing the code.
- Numbers: 12
- Strings single quote: 'hello'
- Strings double quote: "hello"
- Objects: { hello: 'world' }
- Objects: { 'hello': 'world' }
- Object access using paths: hello.world
- Arrays: [ 'hello', 'world' ]
- Array/object access using values: hello[0]
- Calls: hello.world()
- Parameters: hello('world')
- Expression separation: hello(); world()
- Assignment operator: hello = world
- Addition operator: hello + world
- Addition assignment operator: hello += world
*/

const NUMBER_MATCHER = new RegExp('[0-9]')
const NUMBER_PARSER = new RegExp('[0-9.]{1,}')

const STRING_MATCHER = new RegExp('[\'"]')
const STRING_PARSER = new RegExp('^([\'"])(?:(?=(\\\\?))\\2.)*?\\1', 's')

const TYPES = {
  ADDITION_ASSIGN: 0,
  ADDITION: 1,
  ARRAY: 2,
  ASSIGN: 3,
  NEW_STATEMENT: 4,
  NUMBER: 5,
  OBJECT: 6,
  PATH_SEPARATION: 7,
  STRING: 8,
  VARIABLE: 9,
}

const parseText = (text) => {
  const textLength = text.length

  // Parse data.
  const data = []
  const path = []

  const get = () => {
    let value = data
    for (const pathSegment of path) {
      value = value[pathSegment]
    }
    return value
  }
  const set = (value) => {
    let dataNode = data
    const pathLength = path.length
    // Get second to last item. Should be an object.
    for (let i = 0; i < pathLength - 1; i++) {
      dataNode = dataNode[path[i]]
    }
    // Set value on object.
    if (Array.isArray(dataNode)) {
      dataNode.push(value)
    } else {
      dataNode[path[pathLength - 1]] = value
    }
  }
  const wrap = (value) => {
    // TODO:
    // Get last array and override it with this value assign the array to the value.value property.
  }

  const lastIsValue = () => {
    // Ensure the previous node is either an array, number, object, string, or variable.
    const previousType = get().type
    return previousType === TYPES.ARRAY || previousType === TYPES.NUMBER || previousType === TYPES.OBJECT || previousType === TYPES.STRING || previousType === TYPES.VARIABLE
  }
  const lastIsAssignable = () => {
    // Ensure the previous node is either an array, number, object, string, or variable.
    const previousType = get().type
    return previousType === TYPES.NUMBER || previousType === TYPES.STRING || previousType === TYPES.VARIABLE
  }

  // Start iterating over the text.
  let index = 0
  while (index < textLength) {
    const character = text[index]
    switch (character) {
      case '(':
        // TODO:
        throw new Error(character + ' encountered')
      // continue

      case ')':
        // TODO:
        // Pop the path util an function is popped, if an array, object or path is encountered first than something wasn't closed properly.
        throw new Error(character + ' encountered')
      // continue

      case '[':
        // TODO:
        // Could be an array or path. Path segments always happen after a variable delectation.
        throw new Error(character + ' encountered')
      // continue

      case ']':
        // TODO:
        // Pop the path util an array or path is popped, if an object or function is encountered first than something wasn't closed properly.
        throw new Error(character + ' encountered')
      // continue

      case '{':
        // TODO:
        throw new Error(character + ' encountered')
      // continue

      case '}':
        // TODO:
        // Pop the path util an object is popped, if an array, path or function is encountered first than something wasn't closed properly.
        throw new Error(character + ' encountered')
      // continue

      case '=':
        if (!lastIsAssignable()) {
          throw new Error('Unexpected assignment found at "' + index + '"', text)
        }

        // TODO:
        throw new Error(character + ' encountered')
      // continue

      case '+':
        if (!lastIsAssignable()) {
          throw new Error('Unexpected addition found at "' + index + '"', text)
        }

        // Look ahead for an assignment operator.
        if (text[index + 1] === '=') {
          set({
            type: TYPES.ADDITION_ASSIGN,
          })
          index += 2
          continue
        }

        // Addition operator.
        set({
          type: TYPES.ADDITION,
        })
        break

      case ',':
        if (!lastIsValue()) {
          throw new Error('Unexpected comma found at "' + index + '"', text)
        }
        break

      case '.':
        // TODO:
        throw new Error(character + ' encountered')
      // break

      case ';':
        wrap({ type: TYPES.PATH_SEPARATION })
        break

      default:
        // Check for a number match.
        if (NUMBER_MATCHER.test(character)) {
          // Parse expecting a number.
          const match = NUMBER_PARSER.exec(text.substring(index))

          // Store in parse tree.
          set({
            type: TYPES.NUMBER,
            value: Number.parseFloat(match[0]),
          })

          // Move to after the number.
          index += match[0].length

          continue
        }

        // Check for a string match.
        if (STRING_MATCHER.test(character)) {
          // Parse expecting a string.
          const match = STRING_PARSER.exec(text.substring(index))
          if (match < 0) {
            throw new Error('Parsing error. Missing ending quote of string at index "' + index + '".', text)
          }

          // Store in parse tree.
          set({
            type: TYPES.STRING,
            value: match[0].substring(1, match[0].length - 1),
          })

          // Move to after the string.
          index += match[0].length

          continue
        }

      // TODO: Check for variable name or path.
    }

    // Move to the next character.
    index++
  }

  return data
}

// FIX: Tests.
console.log(
  parseText('12.34, 90, 56.78')
)
console.log(
  parseText('"hello", "world"')
)

/*
TODO:
export const evaluate = () => { }

export default {
  evaluate: evaluate,
}
*/
