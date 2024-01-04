import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsPersist.js',
  to: 'dst/doars-persist.esm.js',
}, {
  format: 'iife',
  from: 'src/DoarsPersist.iife.js',
  to: 'dst/doars-persist.iife.js',
}])
