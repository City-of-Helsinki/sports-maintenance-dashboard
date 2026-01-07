/* eslint-disable no-undef */
'use strict';

let path = require('path');
let webpack = require('webpack');

let baseConfig = require('./base');

module.exports = {
  ...baseConfig,
  devtool: 'eval',
  module: {
    rules: [
      {
        test: /\.(png|jpg|gif|woff|woff2|css|sass|scss|less|styl)$/,
        loader: 'null-loader'
      },
      {
        test: /\.(js|jsx)$/,
        loader: require.resolve('babel-loader'),
        include: [].concat(
          [
            path.join(__dirname, '/../src'),
            path.join(__dirname, '/../test')
          ]
        ),
        options: {
          presets: ['@babel/preset-env', '@babel/preset-react'],
          plugins: ['babel-plugin-istanbul']
        }
      }
    ]
  },
  resolve: {
    ...baseConfig.resolve,
    alias: {
      ...baseConfig.resolve.alias,
      helpers: path.join(__dirname, '/../test/helpers')
    }
  },
  plugins: [
    new webpack.ProvidePlugin({
      process: 'process/browser.js',
    })
  ]
};
