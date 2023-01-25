import build from '../../.scripts/esbuild.js'

await build([{
  from: 'src/DoarsAlias.js',
  to: 'dst/doars-alias.js',
}, {
  format: 'iife',
  from: 'src/DoarsAlias.iife.js',
  to: 'dst/doars-alias.iife.js',
}])
