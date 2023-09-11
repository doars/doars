import build from '../../.scripts/esbuild.js'

build([{
  from: 'src/DoarsNavigate.js',
  to: 'dst/doars-navigate.js',
}, {
  format: 'iife',
  from: 'src/DoarsNavigate.iife.js',
  to: 'dst/doars-navigate.iife.js',
}])

// targets:
//   chrome49
//   edge14
//   firefox39
//   ios10.3
//   safari10.1
