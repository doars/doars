import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsRouter.js',
  outfile: 'dst/doars-router.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsRouter.iife.js',
  outfile: 'dst/doars-router.iife.js',
}])