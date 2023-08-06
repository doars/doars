import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsCookies.js',
  to: 'dst/doars-cookies.js',
}, {
  format: 'iife',
  from: 'src/DoarsCookies.iife.js',
  to: 'dst/doars-cookies.iife.js',
}])
