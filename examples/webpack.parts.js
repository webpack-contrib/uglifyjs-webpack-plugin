const UglifyJSPlugin = require('../src');

exports.minifyJS = function minifyJS(options) {
  return {
    plugins: [
      new UglifyJSPlugin(options),
    ],
  };
};
