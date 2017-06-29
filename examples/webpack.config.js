const path = require('path');
const UglifyJSPlugin = require('../');

const PATHS = {
  app: path.join(__dirname, 'app'),
  another: path.join(__dirname, 'another'),
  build: path.join(__dirname, 'build'),
};

module.exports = [
  {
    entry: {
      app: PATHS.app,
    },
    output: {
      path: path.join(PATHS.build, 'first'),
      filename: '[name].js',
    },
    plugins: [
      new UglifyJSPlugin(),
    ],
  },
  {
    entry: {
      first: PATHS.app,
      second: PATHS.another,
    },
    output: {
      path: path.join(PATHS.build, 'second'),
      filename: '[name].js',
    },
    plugins: [
      new UglifyJSPlugin(),
    ],
  },
];
