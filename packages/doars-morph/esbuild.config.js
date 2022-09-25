import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsMorph.js',
  format: 'esm',
  outfile: 'dst/doars-morph.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsMorph.iife.js',
  outfile: 'dst/doars-morph.js',
}])
