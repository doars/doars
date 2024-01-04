import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsFetch.js',
  to: 'dst/doars-fetch.esm.js',
}, {
  format: 'iife',
  from: 'src/DoarsFetch.iife.js',
  to: 'dst/doars-fetch.iife.js',
}])

// Targets:
//   chrome49
//   edge16
//   firefox39
//   ios11.2
//   safari11.1
