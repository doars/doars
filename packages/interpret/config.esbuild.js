import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/index.js',
  to: 'dst/interpret.js',
}])
