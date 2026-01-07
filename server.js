/*eslint no-console:0, no-undef:0 */
'use strict';
require('core-js/internals/object-assign.js');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const config = require('./webpack.config');

const compiler = webpack(config);
const server = new WebpackDevServer(config.devServer, compiler);

const runServer = async () => {
  console.log('Starting server...');
  await server.start();
  console.log('Listening at localhost:' + config.devServer.port);
  console.log('Opening your system browser...');
};

runServer();
