'use strict';

let path = require('path');
let webpack = require('webpack');
let baseConfig = require('./base');
let defaultSettings = require('./defaults');

// Add needed plugins here
const ReactRefreshWebpackPlugin = require('@pmmmwh/react-refresh-webpack-plugin');
const DotenvPlugin = require('webpack-dotenv-plugin');

let config = Object.assign({}, baseConfig, {
  entry: [
    'webpack-dev-server/client?http://127.0.0.1:' + defaultSettings.port,
    'webpack/hot/only-dev-server',
    './src/index'
  ],
  cache: true,
  devtool: 'eval-source-map',
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
      new webpack.ProvidePlugin({
          $: "jquery",
          jQuery: "jquery"
      }),
    new DotenvPlugin({
      sample: './.env.example',
      path: './.env'
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true
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
