import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsView.js',
  format: 'esm',
  outfile: 'dst/doars-view.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsView.iife.js',
  outfile: 'dst/doars-view.js',
}])
