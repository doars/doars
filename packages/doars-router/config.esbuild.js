import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsRouter.js',
  to: 'dst/doars-router.esm.js',
}, {
  format: 'iife',
  from: 'src/DoarsRouter.iife.js',
  to: 'dst/doars-router.iife.js',
}])
