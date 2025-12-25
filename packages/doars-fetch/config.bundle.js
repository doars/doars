import bundle from '../../helpers/bundle.js'

bundle([{
  entrypoints: 'src/DoarsFetch.js',
  outfile: 'dst/doars-fetch.esm.js',
}, {
  format: 'iife',
  entrypoints: 'src/DoarsFetch.iife.js',
  outfile: 'dst/doars-fetch.iife.js',
}])