import build from '../../scripts/build.js'

build({
  in: 'src/DoarsFetch.js',
  out: 'dst/doars-fetch.js',
}, null, {
  targets: {
    chrome: '49',
    edge: '14',
    firefox: '39',
    ios: '10.3',
    safari: '10.1',
  },
})
