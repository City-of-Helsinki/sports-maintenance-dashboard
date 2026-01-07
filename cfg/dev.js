/* eslint-disable no-undef */
'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const Dotenv = require('dotenv-webpack');

let config = Object.assign({}, baseConfig, {
  entry: [
    './src/index'
  ],
  cache: true,
  devtool: 'eval-source-map',
  optimization: {
    emitOnErrors: false
  },
  plugins: [
    new webpack.ProvidePlugin({
      $: "jquery",
      jQuery: "jquery"
    }),
    new Dotenv({
      path: './.env',
      safe: './.env.example',
      ignoreStub: true
    }),
    new ReactRefreshWebpackPlugin()
  ],
  module: defaultSettings.getDefaultModules()
});

// Add needed loaders to the defaults here
config.module.rules.push({
  test: /\.(js|jsx)$/,
  use: [
    {
      loader: require.resolve('babel-loader'),
      options: {
        plugins: [require.resolve('react-refresh/babel')],
      }
    }
  ],
  include: [].concat(
    [ path.join(__dirname, '/../src') ]
  )
});

module.exports = config;
