const customLaunchers = {
  'SL_Chrome': {
    base: 'SauceLabs',
    browserName: 'chrome',
    version: '47.0',
    platform: 'Linux'
  },
  'SL_Firefox': {
    base: 'SauceLabs',
    browserName: 'firefox',
    version: '50.0',
    platform: 'Windows 10'
  },
  'SL_InternetExplorer': {
    base: 'SauceLabs',
    browserName: 'internet explorer',
    version: '11.0',
    platform: 'Windows 7'
  },
  'SL_Safari': {
    base: 'SauceLabs',
    browserName: 'safari',
    platform: 'OS X 10.11',
    version: '10.0'
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
    browserNoActivityTimeout: 120000,
    concurrency: 2,

    sauceLabs: {
      testName: 'Exonum anchoring unit tests'
    },
    customLaunchers: customLaunchers,
    browsers: Object.keys(customLaunchers),
    singleRun: true
  })
}
