[![build status](https://secure.travis-ci.org/webpack-contrib/uglifyjs-webpack-plugin.svg)](http://travis-ci.org/webpack-contrib/uglifyjs-webpack-plugin) [![bitHound Score](https://www.bithound.io/github/webpack-contrib/uglifyjs-webpack-plugin/badges/score.svg)](https://www.bithound.io/github/webpack-contrib/uglifyjs-webpack-plugin) [![codecov](https://codecov.io/gh/webpack-contrib/uglifyjs-webpack-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/webpack-contrib/uglifyjs-webpack-plugin)

# UglifyJS Webpack Plugin (experimental!)

This plugin uses [UglifyJS](https://github.com/mishoo/UglifyJS2) to minify your JavaScript.

## Usage

First, install it:

```bash
npm install uglifyjs-webpack-plugin --save-dev
```

Then configure as follows:

```javascript
const UglifyJSPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {...},
  output: {...},
  module: {...},
  plugins: [
    new UglifyJSPlugin()
  ]
};
```

And, that's it!

## Options

This plugin supports UglifyJS features as discussed below:

| Property            | Description
|---------------------|------------
| TODO | TODO

## License

MIT.
