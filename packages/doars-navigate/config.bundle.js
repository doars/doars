import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsNavigate.js',
  outfile: 'dst/doars-navigate.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsNavigate.iife.js',
  outfile: 'dst/doars-navigate.iife.js',
}])