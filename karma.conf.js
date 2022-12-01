var webpackCfg = require('./webpack.config');
process.env.CHROME_BIN = require('puppeteer').executablePath();

// Set node environment to testing
process.env.NODE_ENV = 'test';

module.exports = function(config) {
  config.set({
    basePath: '',
    browsers: [ 'HeadlessChrome' ],
    customLaunchers: {
      HeadlessChrome: {
          base: 'ChromeHeadless',
          flags: [
              '--disable-gpu',
              '--no-sandbox',
              '--disable-setuid-sandbox',
              '--single-process',
          ]
      }
    },
    files: [
      'test/loadtests.js'
    ],
    frameworks: [
      'chai'
    ],
    plugins: [
      'karma-webpack',
      'karma-sourcemap-loader',
      'karma-mocha',
      'karma-chai',
      'karma-mocha-reporter',
      'karma-coverage',
      'karma-chrome-launcher'
    ],
    port: 8000,
    captureTimeout: 60000,
    frameworks: [ 'mocha', 'chai' ],
    client: {
      mocha: {}
    },
    singleRun: true,
    reporters: [ 'mocha', 'coverage' ],
    preprocessors: {
      'test/loadtests.js': [ 'webpack', 'sourcemap' ]
    },
    webpack: webpackCfg,
    webpackServer: {
      noInfo: true
    },
    coverageReporter: {
      dir: 'coverage/',
      reporters: [
        { type: 'html' },
        { type: 'text' }
      ]
    }
  });
};
