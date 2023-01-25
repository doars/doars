import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsMorph.js',
  to: 'dst/doars-morph.js',
}, {
  format: 'iife',
  from: 'src/DoarsMorph.iife.js',
  to: 'dst/doars-morph.iife.js',
}])
