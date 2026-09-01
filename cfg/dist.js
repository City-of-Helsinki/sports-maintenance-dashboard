/* eslint-disable no-undef */
'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const TerserPlugin = require("terser-webpack-plugin");
const Dotenv = require('dotenv-webpack');

let config = Object.assign({}, baseConfig, {
  mode: 'production',
  entry: path.join(__dirname, '../src/index'),
  cache: false,
  devtool: 'source-map',
  plugins: [
    new Dotenv({
      path: './.env',
      safe: false,
      systemvars: true,
      defaults: {
        'API_URL': 'https://api.hel.fi/servicemap/v2',
        'REACT_APP_SENTRY_DSN': '',
        'REACT_APP_SENTRY_ENVIRONMENT': '',
        'REACT_APP_SENTRY_RELEASE': '',
        'REACT_APP_SENTRY_TRACES_SAMPLE_RATE': '0',
        'REACT_APP_SENTRY_TRACE_PROPAGATION_TARGETS': '',
        'REACT_APP_SENTRY_PROFILES_SAMPLE_RATE': '0',
        'REACT_APP_SENTRY_REPLAYS_SESSION_SAMPLE_RATE': '0',
        'REACT_APP_SENTRY_REPLAYS_ON_ERROR_SAMPLE_RATE': '0'
      }
    }),
    new webpack.optimize.AggressiveMergingPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    })
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin()],
  },
  module: defaultSettings.getDefaultModules()
});

// Add needed rules to the defaults here
config.module.rules.push({
  test: /\.(js|jsx)$/,
  loader: 'babel-loader',
  include: [].concat(
    [ path.join(__dirname, '/../src') ]
  )
});

config.module.rules.push({
  test: /\.(ts|tsx)$/,
  use: [
    'babel-loader',
    {
      loader: 'ts-loader',
      options: {
        transpileOnly: true
      }
    }
  ],
  include: [].concat(
    [ path.join(__dirname, '/../src') ]
  )
});

module.exports = config;
