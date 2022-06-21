import build from '../../scripts/build.js'

const files = [{
  in: 'src/DoarsCall.js',
  out: 'dst/doars-call.js',
}, {
  in: 'src/DoarsExecute.js',
  out: 'dst/doars.js',
}, {
  in: 'src/DoarsInterpret.js',
  out: 'dst/doars-interpret.js',
}]

for (const file of files) {
  build(file)
}
