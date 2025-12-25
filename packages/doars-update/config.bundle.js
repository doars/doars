import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsUpdate.js',
  outfile: 'dst/doars-update.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsUpdate.iife.js',
  outfile: 'dst/doars-update.iife.js',
}])