import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsCall.js',
  outfile: 'dst/doars-call.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsCall.iife.js',
  outfile: 'dst/doars-call.iife.js',
}, {
  entrypoints: 'src/DoarsExecute.js',
  outfile: 'dst/doars.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsExecute.iife.js',
  outfile: 'dst/doars.iife.js',
}, {
  entrypoints: 'src/DoarsInterpret.js',
  outfile: 'dst/doars-interpret.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsInterpret.iife.js',
  outfile: 'dst/doars-interpret.iife.js',
}])
