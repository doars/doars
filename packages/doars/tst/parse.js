import { parse } from '../src/utils/ParseUtils.js'

const tests = [
  '("hello")',
  '(1 + 2)',
  '(a + 2 == 3)',
]
for (const code of tests) {
  console.log(parse(code))
}
