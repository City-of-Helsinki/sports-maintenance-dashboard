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
        'API_URL': 'https://api.hel.fi/servicemap/v2'
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
