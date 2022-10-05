import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsAlias.js',
  format: 'esm',
  outfile: 'dst/doars-alias.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsAlias.iife.js',
  outfile: 'dst/doars-alias.js',
}])
