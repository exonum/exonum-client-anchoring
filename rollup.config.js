import path from 'path'

import cleanup from 'rollup-plugin-cleanup'
import babel from 'rollup-plugin-babel'
import uglify from 'rollup-plugin-uglify'
import eslint from 'rollup-plugin-eslint'
import localResolve from 'rollup-plugin-local-resolve'

const SRC = path.resolve('src')
const DIST = path.resolve('dist')

export default {
  sourceMap: false,
  name: 'exonum-anchoring',

  external: ['axios', 'exonum-client'],

  input: path.join(SRC, 'index.js'),
  output: {
    file: path.join(DIST, 'index.js'),
    format: 'umd',
    exports: 'named',

    globals: {
      'axios': 'axios',
      'exonum-client': 'exonum-client'
    }
  },

  plugins: [
    localResolve(),
    eslint(),
    babel(),
    cleanup(),
    uglify()
  ]
}
