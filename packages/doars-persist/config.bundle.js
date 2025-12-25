import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsPersist.js',
  outfile: 'dst/doars-persist.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsPersist.iife.js',
  outfile: 'dst/doars-persist.iife.js',
}])