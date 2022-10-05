import build from '../../.scripts/build.js'

build([{
  entryPoints: 'src/DoarsFetch.js',
  format: 'esm',
  outfile: 'dst/doars-fetch.js',
}, {
  format: 'iife',
  entryPoints: 'src/DoarsFetch.iife.js',
  outfile: 'dst/doars-fetch.js',
}], {
  targets: {
    chrome: '49',
    edge: '14',
    firefox: '39',
    ios: '10.3',
    safari: '10.1',
  },
})
