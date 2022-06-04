// TODO:
// import { createContexts } from './ContextUtils.js'

/*
TODO: Parse expression and lookup on context instead of executing the code.
- [O] Numbers: 12
- [O] Strings single quote: 'hello'
- [O] Strings double quote: "hello"
- [O] Comma: hello, world
- [O] Null: null
- [O] Undefined: undefined
- [O] Variables: $var_able5
- [ ] Objects: { 'hello': 'world' }
- [ ] Object access using paths: hello.world
- [ ] Arrays: [ 'hello', 'world' ]
- [ ] Array/object access using values: hello[0]
- [ ] Calls: hello.world()
- [ ] Parameters: hello('world')
- [ ] Expression separation: hello(); world()
- [ ] Assignment operator: hello = world
- [ ] Addition operator: hello + world
- [ ] Comparison equal operator: hello == world
- [ ] Comparison equal strict operator: hello === world
- [ ] Comparison not equal operator: hello != world
- [ ] Comparison not equal strict operator: hello !== world
- [ ] Addition assignment operator: hello += world
*/

const NUMBER_MATCHER = /[0-9]/
const NUMBER_PARSER = /^[0-9.]{1,}/s

const STRING_MATCHER = /['"]/
const STRING_PARSER = /^(['"])(?:(?=(\\?))\2.)*?\1/s

const WHITESPACE_MATCHER = /\s/
const WHITESPACE_PARSER = /^(\s+)/s

const WORD_MATCHER = /[a-z$_]/i
const WORD_PARSER = /^([a-z$_]+[0-9a-z$_]+)/is

const TYPES = {
  ADDITION_ASSIGN: 0,
  ADDITION: 1,
  ARRAY: 2,
  ASSIGN: 3,
  DECREMENT: 4,
  EQUAL_STRICT: 5,
  EQUAL: 6,
  INCREMENT: 7,
  NEW_STATEMENT: 8,
  NOT: 9,
  NOT_EQUAL_STRICT: 9,
  NOT_EQUAL: 10,
  NULL: 11,
  NUMBER: 12,
  OBJECT: 13,
  PATH_SEPARATION: 14,
  STRING: 15,
  SUBTRACTION: 16,
  SUBTRACTION_ASSIGN: 17,
  UNDEFINED: 18,
  VARIABLE: 19,
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
    if (Array.isArray(value)) {
      return value[value.length - 1]
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
    return previousType === TYPES.ARRAY || previousType === TYPES.NULL || previousType === TYPES.NUMBER || previousType === TYPES.OBJECT || previousType === TYPES.STRING || previousType === TYPES.UNDEFINED || previousType === TYPES.VARIABLE
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

      case '!':
        if (!lastIsValue()) {
          throw new Error('Unexpected exclamation (!) symbol found at "' + index + '": ' + text)
        }

        if (text.substring(index + 1, 2) === '==') {
          set({
            type: TYPES.EQUAL_STRICT,
          })
          index += 3
          continue
        }
        if (text[index + 1] === '=') {
          set({
            type: TYPES.EQUAL,
          })
          index += 2
          continue
        }
        set({
          type: TYPES.NOT,
        })
        break

      case '=':
        if (!lastIsValue()) {
          throw new Error('Unexpected equal (=) symbol found at "' + index + '": ' + text)
        }

        if (text.substring(index + 1, 2) === '==') {
          set({
            type: TYPES.EQUAL_STRICT,
          })
          index += 3
          continue
        }
        if (text[index + 1] === '=') {
          set({
            type: TYPES.EQUAL,
          })
          index += 2
          continue
        }
        set({
          type: TYPES.ASSIGN,
        })
        break

      case '-':
        if (!lastIsValue()) {
          throw new Error('Unexpected subtraction (-) symbol found at "' + index + '": ' + text)
        }

        if (text[index + 1] === '-') {
          set({
            type: TYPES.DECREMENT,
          })
          index += 2
          continue
        }
        if (text[index + 1] === '=') {
          set({
            type: TYPES.SUBTRACTION_ASSIGN,
          })
          index += 2
          continue
        }
        set({
          type: TYPES.SUBTRACTION,
        })
        break

      case '+':
        if (!lastIsValue()) {
          throw new Error('Unexpected addition (+) symbol found at "' + index + '": ' + text)
        }

        if (text[index + 1] === '+') {
          set({
            type: TYPES.INCREMENT,
          })
          index += 2
          continue
        }
        if (text[index + 1] === '=') {
          set({
            type: TYPES.ADDITION_ASSIGN,
          })
          index += 2
          continue
        }
        set({
          type: TYPES.ADDITION,
        })
        break

      case ',':
        if (!lastIsValue()) {
          throw new Error('Unexpected comma found at "' + index + '": ' + text)
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
        // Skip whitespace.
        if (WHITESPACE_MATCHER.test(character)) {
          const match = WHITESPACE_PARSER.exec(text.substring(index))
          index += match[0].length
          continue;
        }

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

        if (WORD_MATCHER.test(character)) {
          // Parse expecting a string.
          const match = WORD_PARSER.exec(text.substring(index))

          // Check for keywords.
          switch (match[0]) {
            case 'null':
              set({
                type: TYPES.NULL,
              })
              index += 4
              break;

            case 'undefined':
              set({
                type: TYPES.UNDEFINED,
              })
              index += 9
              break;

            // Otherwise assume it is a variable.
            default:
              set({
                type: TYPES.VARIABLE,
                value: match[0],
              })

              // TODO: Look ahead for a function call!

              // Move to after the variable.
              index += match[0].length
              break;
          }

          continue;
        }

        throw new Error('Unable to continue parsing code: ' + text.substring(index))
    }

    // Move to the next character.
    index++
  }

  return data
}

(function () {
  const tests = {
    float: '34.56',
    int: '12',
    null: 'null',
    string: '"string"',
    undefined: 'undefined',
    variable: 'variable',
    variableWithCapital: 'variAble',
    variableWithDollar: '$variable',
    variableWithNumber: 'var1able',
    variableWithUnderscore: 'var_able',
    whitespace: ' ',
    commas: '12.34, 56, null, "hello", undefined',
  };

  let name = null, result = null
  const names = Object.keys(tests)
  for (let i = 0; i < names.length; i++) {
    name = names[i];

    try {
      result = parseText(tests[name])
    } catch (error) {
      console.warn(error)
      continue;
    }
  }
  console.log('"' + name + '": ', result)
}())

// TODO:
// export const evaluate = () => {
//   throw new Error('Not yet implemented')
// }

// export default {
//   evaluate: evaluate,
// }
