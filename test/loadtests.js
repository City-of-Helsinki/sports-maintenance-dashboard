'use strict';

require('@babel/polyfill');
require('core-js/internals/object-assign.js');

// Add support for all files in the test directory
const testsContext = require.context('.', true, /(Test\.js$)|(Helper\.js$)/);
testsContext.keys().forEach(testsContext);
