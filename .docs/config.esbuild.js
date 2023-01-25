import build from '../.scripts/esbuild.js'

build({
  from: 'src/scripts/index.js',
  to: '../docs/index.js',
})
