import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsCall.js',
  to: 'dst/doars-call.js',
}, {
  format: 'iife',
  from: 'src/DoarsCall.iife.js',
  to: 'dst/doars-call.iife.js',
}, {
  from: 'src/DoarsExecute.js',
  to: 'dst/doars.js',
}, {
  format: 'iife',
  from: 'src/DoarsExecute.iife.js',
  to: 'dst/doars.iife.js',
}, {
  from: 'src/DoarsInterpret.js',
  to: 'dst/doars-interpret.js',
}, {
  format: 'iife',
  from: 'src/DoarsInterpret.iife.js',
  to: 'dst/doars-interpret.iife.js',
}])
