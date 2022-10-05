import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsRouter.js',
  format: 'esm',
  outfile: 'dst/doars-router.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsRouter.iife.js',
  outfile: 'dst/doars-router.js',
}])
