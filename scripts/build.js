import babel from 'esbuild-plugin-babel'
import brotliSize from 'brotli-size'
import esbuild from 'esbuild'
import path from 'path'

const logFileSize = async (filePath) => {
  let size = await brotliSize.file(filePath)
  if (!size || size <= 0) {
    size = 'NaN'
  } else {
    size = (size / 1024).toFixed(2) + 'kB'
  }
  console.log(size + ' is ' + path.basename(filePath) + ' when using brotli compression!')
}

export default (file, formats = null, options = {}) => {
  // Ensure formats are set.
  if (!formats) {
    formats = [{
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
  }

  for (const format of formats) {
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
    }, format)

    // Setup file paths.
    buildOptions.entryPoints = [file.in]
    buildOptions.outfile = file.out

    // Construct target file path.
    const suffixes = [format.format]
    if (format.minify) {
      suffixes.push('min')
    }
    let filePath = buildOptions.outfile.split('.')
    filePath.splice(filePath.length - 1, 0, ...suffixes)
    buildOptions.outfile = filePath = filePath.join('.')

    // Build library.
    esbuild
      .build(buildOptions)
      .then(() => {
        if (format.minify) {
          logFileSize(filePath)
        }
      })
      .catch(() => process.exit(1))
  }
}
