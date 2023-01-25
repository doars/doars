import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsStore.js',
  to: 'dst/doars-store.js',
}, {
  format: 'iife',
  from: 'src/DoarsStore.iife.js',
  to: 'dst/doars-store.iife.js',
}])
