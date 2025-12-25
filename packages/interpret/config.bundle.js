import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/index.js',
  outfile: 'dst/interpret.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/iife.js',
  outfile: 'dst/interpret.iife.js',
}])