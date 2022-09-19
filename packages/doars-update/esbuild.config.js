import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsUpdate.js',
  format: 'esm',
  outfile: 'dst/doars-update.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsUpdate.iife.js',
  outfile: 'dst/doars-update.js',
}])
