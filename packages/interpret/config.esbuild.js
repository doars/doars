import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/index.js',
  to: 'dst/interpret.js',
}, {
  format: 'iife',
  from: 'src/iife.js',
  to: 'dst/interpret.iife.js',
}])
