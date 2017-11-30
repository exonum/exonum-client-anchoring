import path from 'path'

import cleanup from 'rollup-plugin-cleanup'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import eslint from 'rollup-plugin-eslint'
import resolve from 'rollup-plugin-node-resolve'
import commonjs from 'rollup-plugin-commonjs'
import builtins from 'rollup-plugin-node-builtins'

const SRC = path.resolve('src')
const DIST = path.resolve('dist')

const browser = !!process.env.BROWSER
const output = browser ? 'index.js' : 'node.js'

const external = ['axios', 'exonum-client', 'bitcoinjs-lib']
const nodeExternals = ['fs', 'buffer']

export default {
  sourceMap: false,
  name: 'exonum-anchoring',

  external: external.concat(!browser && nodeExternals),

  input: path.join(SRC, 'index.js'),
  output: {
    file: path.join(DIST, output),
    format: 'umd',
    exports: 'named',

    globals: {
      'axios': 'axios',
      'exonum-client': 'exonum-client',
      'bitcoinjs-lib': 'bitcoinjs-lib',
      'buffer': 'buffer'
    }
  },

  plugins: [
    builtins(),
    resolve({ browser }),
    commonjs(),
    eslint(),
    babel({
      plugins: [['transform-runtime', {
        'helpers': false,
        'polyfill': false,
        'regenerator': true
      }]],
      runtimeHelpers: true
    }),
    cleanup(),
    uglify()
  ]
}
