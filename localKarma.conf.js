module.exports = function (config) {
  config.set({
    basePath: '',
    frameworks: ['browserify', 'mocha'],
    files: ['./test/index.js'],
    exclude: [],
    preprocessors: { 'test/index.js': ['browserify'] },

    browserify: {
      debug: true,
      transform: [
        ['babelify', {
          presets: ['env'],
          global: true,
          ignore: /\/node_modules\/(?!chai-as-promised|bech32\/)/,
          plugins: ['transform-runtime']
        }]
      ]
    },

    reporters: ['mocha'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browsers: ['PhantomJS', 'Firefox'],
    browserNoActivityTimeout: 30000,
    singleRun: true,
    concurrency: Infinity
  })
}
