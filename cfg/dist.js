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
  // named so output.filename below can resolve '[name]' to 'app', matching index.html
  entry: { app: path.join(__dirname, '../src/index') },
  cache: false,
  devtool: 'source-map',
  output: Object.assign({}, baseConfig.output, {
    // runtimeChunk is also an initial entry chunk, so it uses `filename` (not `chunkFilename`) too;
    // without '[name]' here it collides with the main chunk on the fixed 'app.js' name
    filename: '[name].js',
    chunkFilename: '[name].js'
  }),
  plugins: [
    new Dotenv({
      path: './.env',
      safe: false,
      systemvars: true,
      // true loads ./.env.defaults, since options.path is left at its default
      defaults: true
    }),
    // moment ships 150+ locale files by default; the app only ever sets 'fi'
    new webpack.ContextReplacementPlugin(/moment[\\/]locale$/, /^fi$/),
    new webpack.NoEmitOnErrorsPlugin()
  ],
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      terserOptions: {
        compress: {
          drop_console: true,
          passes: 2
        },
        format: {
          comments: false
        }
      },
      extractComments: false
    })],
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
