import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsIntersect.js',
  format: 'esm',
  outfile: 'dst/doars-intersect.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsIntersect.iife.js',
  outfile: 'dst/doars-intersect.js',
}])
