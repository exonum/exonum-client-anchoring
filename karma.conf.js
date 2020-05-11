const customLaunchers = {
  'SL_Chrome': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '48',
    platform: 'Linux'
  },
  'SL_Firefox': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '76',
    platform: 'Windows 10'
  },
  'SL_Edge': {
    base: 'SauceLabs',
    browserName: 'MicrosoftEdge',
    version: '79',
    platform: 'Windows 10'
  },
  'SL_Safari': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'macOS 10.14',
    version: '12.0'
  }
}

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

    reporters: ['mocha', 'saucelabs'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: false,
    browserNoActivityTimeout: 180000,
    concurrency: 5,

    sauceLabs: {
      testName: 'Exonum anchoring unit tests'
    },
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  })
}
