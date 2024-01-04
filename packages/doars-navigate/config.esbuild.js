import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsNavigate.js',
  to: 'dst/doars-navigate.esm.js',
}, {
  format: 'iife',
  from: 'src/DoarsNavigate.iife.js',
  to: 'dst/doars-navigate.iife.js',
}])

// Targets:
//   chrome49
//   edge16
//   firefox39
//   ios11.2
//   safari11.1
