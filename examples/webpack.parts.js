const UglifyJSPlugin = require('../');

exports.minifyJS = function minifyJS(options) {
  return {
    plugins: [
      new UglifyJSPlugin(options)
    ]
  };
};
