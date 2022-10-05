import babel from 'esbuild-plugin-babel'
import brotliSize from 'brotli-size'
import esbuild from 'esbuild'
import path from 'path'

const logFileSize = async (filePath) => {
  brotliSize.file(filePath)
    .then((size) => {
      size = (size / 1024).toFixed(2) + 'kB'
      console.log(size + ' is ' + path.basename(filePath) + ' when using brotli compression!')
    }).catch(() => {
      console.log('Unable to determine file size of ' + path.basename(filePath))
    })
}

export default (files, options = {}) => {
  // For production builds add the minified files as well.
  if (process.env.NODE_ENV === 'production') {
    let filesClone = [...files]
    for (const file of files) {
      filesClone.push(Object.assign({
        minify: true,
      }, file))
    }
    files = filesClone
  }

  for (const file of files) {
    // Ensure build targets are set.
    let buildTargets = {
      chrome: '49',
      edge: '12',
      firefox: '39',
      ios: '10.2',
      safari: '10',
    }
    if (options && options.targets) {
      if (typeof (options.targets) === 'object') {
        buildTargets = Object.assign(buildTargets, options.targets)
      } else {
        buildTargets = options.targets
      }
    }

    // Setup build options.
    const buildOptions = Object.assign({
      bundle: true,
      sourcemap: true,

      platform: 'browser',
      plugins: [
        babel({
          presets: [
            ['@babel/preset-env', {
              targets: buildTargets,
            }],
          ],
        }),
      ],

      watch: process.env.NODE_ENV === 'development',
    }, file)

    // Setup file paths.
    if (!Array.isArray(buildOptions.entryPoints)) {
      buildOptions.entryPoints = [buildOptions.entryPoints]
    }

    // Construct target file path.
    const suffixes = [file.format]
    if (file.minify) {
      suffixes.push('min')
    }
    let filePath = buildOptions.outfile.split('.')
    filePath.splice(filePath.length - 1, 0, ...suffixes)
    buildOptions.outfile = filePath = filePath.join('.')

    // Build library.
    esbuild
      .build(buildOptions)
      .then(() => {
        // Log file size for production builds.
        if (file.minify) {
          logFileSize(filePath)
        }
      })
      // Exit on error.
      .catch(() => process.exit(1))
  }
}
