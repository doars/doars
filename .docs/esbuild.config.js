import esbuild from 'esbuild'
import babel from 'esbuild-plugin-babel'

const options = {
  entryPoints: [
    'src/scripts/index.js',
  ],
  outfile: '../docs/index.js',

  bundle: true,
  format: 'iife',
  minify: true,
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

esbuild
  .build(options)
  .catch(() => process.exit(1))
