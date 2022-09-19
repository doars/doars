import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsCall.js',
  format: 'esm',
  outfile: 'dst/doars-call.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsCall.iife.js',
  outfile: 'dst/doars-call.js',
}, {
  format: 'esm',
  entryPoints: 'src/DoarsExecute.js',
  outfile: 'dst/doars.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsExecute.iife.js',
  outfile: 'dst/doars.js',
}, {
  format: 'esm',
  entryPoints: 'src/DoarsInterpret.js',
  outfile: 'dst/doars-interpret.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsInterpret.iife.js',
  outfile: 'dst/doars-interpret.js',
}])
