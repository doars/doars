import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsLocalStorage.js',
  to: 'dst/doars-local-storage.js',
}, {
  format: 'iife',
  from: 'src/DoarsLocalStorage.iife.js',
  to: 'dst/doars-local-storage.iife.js',
}])
