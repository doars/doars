import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsStore.js',
  format: 'esm',
  outfile: 'dst/doars-store.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsStore.iife.js',
  outfile: 'dst/doars-store.js',
}])
