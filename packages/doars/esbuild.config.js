import esbuild from 'esbuild'
import babel from 'esbuild-plugin-babel'

const defaultOptions = {
  bundle: true,
  sourcemap: true,

  platform: 'browser',
  plugins: [
    babel({
      presets: [
        ['@babel/preset-env', {
          targets: {
            chrome: '49',
            edge: '12',
            firefox: '39',
            ios: '10.2',
            safari: '10',
          },
        }],
      ],
    }),
  ],

  watch: process.env.NODE_ENV === 'development',
}

const files = [{
  entryPoints: [
    'src/DoarsCall.js',
  ],
  outfile: 'dst/doars-call.js',
}, {
  entryPoints: [
    'src/DoarsExecute.js',
  ],
  outfile: 'dst/doars.js',
}, {
  entryPoints: [
    'src/DoarsInterpret.js',
  ],
  outfile: 'dst/doars-interpret.js',
}]

const formats = [{
  format: 'esm',
  minify: false,
}, {
  format: 'iife',
  minify: false,
}]
// For production builds add the minified files as well.
if (process.env.NODE_ENV === 'production') {
  formats.push({
    format: 'esm',
    minify: true,
  }, {
    format: 'iife',
    minify: true,
  })
}

for (const file of files) {
  for (const format of formats) {
    const options = Object.assign({}, defaultOptions, file, format)

    const suffixes = [format.format]
    if (format.minify) {
      suffixes.push('min')
    }

    let outputFile = options.outfile.split('.')
    outputFile.splice(outputFile.length - 1, 0, ...suffixes)
    options.outfile = outputFile.join('.')

    esbuild
      .build(options)
      .catch(() => process.exit(1))
  }
}
