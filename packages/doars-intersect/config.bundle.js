import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsIntersect.js',
  outfile: 'dst/doars-intersect.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsIntersect.iife.js',
  outfile: 'dst/doars-intersect.iife.js',
}])