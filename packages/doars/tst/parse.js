import { parse } from '../src/utils/ParseUtils.js'

const tests = [
  '{ hello: "world" }',
  '{ "hello": "world" }',
  '{ [hello]: "world" }',
]
for (const code of tests) {
  console.log(parse(code).properties[0])
}
