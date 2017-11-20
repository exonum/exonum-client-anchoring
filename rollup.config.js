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

export default {
  sourceMap: false,
  name: 'exonum-anchoring',

  external: ['axios', 'exonum-client', 'bitcoinjs-lib'],

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
    commonjs(),
    resolve({ browser }),
    eslint(),
    babel(),
    cleanup(),
    uglify()
  ]
}
