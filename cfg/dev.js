/* eslint-disable no-undef */
'use strict';

let path = require('path');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const Dotenv = require('dotenv-webpack');

let config = Object.assign({}, baseConfig, {
  // named so output.filename below can resolve '[name]' to 'app', matching index.html
  entry: {
    app: ['./src/index']
  },
  cache: true,
  devtool: 'eval-source-map',
  output: Object.assign({}, baseConfig.output, {
    // runtimeChunk is also an initial entry chunk, so it uses `filename` (not `chunkFilename`) too;
    // without '[name]' here it collides with the main chunk on the fixed 'app.js' name
    filename: '[name].js',
    chunkFilename: '[name].js'
  }),
  optimization: {
    emitOnErrors: false,
    runtimeChunk: { name: 'runtime' },
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        // disable the built-in groups: every split-out chunk must be one of the three
        // named groups below, each with a matching <script> tag in src/index.html
        default: false,
        defaultVendors: false,
        vendorReact: {
          test: /[\\/]node_modules[\\/](react|react-dom|react-router|react-router-dom|history|scheduler)[\\/]/,
          name: 'vendor-react',
          filename: 'vendor-react.js',
          chunks: 'all'
        },
        vendorState: {
          test: /[\\/]node_modules[\\/](redux|react-redux|redux-persist|redux-promise|redux-actions)[\\/]/,
          name: 'vendor-state',
          filename: 'vendor-state.js',
          chunks: 'all'
        },
        vendorMisc: {
          test: /[\\/]node_modules[\\/](lodash|moment|urijs|core-js)[\\/]/,
          name: 'vendor-misc',
          filename: 'vendor-misc.js',
          chunks: 'all'
        }
      }
    }
  },
  plugins: [
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
  test: /\.(ts|tsx)$/,
  use: [
    {
      loader: require.resolve('babel-loader'),
      options: {
        plugins: [require.resolve('react-refresh/babel')],
      }
    },
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
