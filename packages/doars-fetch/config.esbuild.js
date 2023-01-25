import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsFetch.js',
  to: 'dst/doars-fetch.js',
}, {
  format: 'iife',
  from: 'src/DoarsFetch.iife.js',
  to: 'dst/doars-fetch.iife.js',
}])

// targets:
//   chrome49
//   edge14
//   firefox39
//   ios10.3
//   safari10.1
