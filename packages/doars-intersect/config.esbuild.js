import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsIntersect.js',
  to: 'dst/doars-intersect.esm.js',
}, {
  format: 'iife',
  from: 'src/DoarsIntersect.iife.js',
  to: 'dst/doars-intersect.iife.js',
}])
