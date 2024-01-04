import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsUpdate.js',
  to: 'dst/doars-update.esm.js',
}, {
  format: 'iife',
  from: 'src/DoarsUpdate.iife.js',
  to: 'dst/doars-update.iife.js',
}])
