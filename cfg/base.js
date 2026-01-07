/* eslint-disable no-undef */
'use strict';
let path = require('path');
let webpack = require('webpack');
let ESLintPlugin = require('eslint-webpack-plugin');
let defaultSettings = require('./defaults');
// Additional npm or bower modules to include in builds
// Add all foreign plugins you may need into this array
// @example:
// let npmBase = path.join(__dirname, '../node_modules');
// let additionalPaths = [ path.join(npmBase, 'react-bootstrap') ];
let additionalPaths = [];

module.exports = {
  mode: 'development',
  devtool: 'eval',
  output: {
    path: path.join(__dirname, '/../dist/assets'),
    filename: 'app.js',
    publicPath: defaultSettings.publicPath
  },
  ignoreWarnings: [
    {
      module: /\.scss$/,
      message: /Future import deprecation is not yet active, so silencing it is unnecessary/,
    },
  ],
  plugins: [
    require('autoprefixer'),
    new webpack.LoaderOptionsPlugin({
      options: {
        port: defaultSettings.port,
        additionalPaths: additionalPaths,
      }
    }),
    new ESLintPlugin({
      files: ['../src/']
    })
  ],
  devServer: {
    static: './src/',
    historyApiFallback: true,
    hot: true,
    port: defaultSettings.port,
    client: {
      overlay: true
    },
    devMiddleware: {
      publicPath: defaultSettings.publicPath,
    },
    host: '0.0.0.0',
    allowedHosts: 'all'
  },
  resolve: {
    extensions: ['.js', '.jsx'],
    fallback: {
      "process": require.resolve("process/browser.js")
    },
    alias: {
      actions: `${defaultSettings.srcPath}/actions/`,
      components: `${defaultSettings.srcPath}/components/`,
      sources: `${defaultSettings.srcPath}/sources/`,
      stores: `${defaultSettings.srcPath}/stores/`,
      styles: `${defaultSettings.srcPath}/styles/`,
      config: `${defaultSettings.srcPath}/config/` + process.env.REACT_WEBPACK_ENV
    }
  },
  module: {}
};
