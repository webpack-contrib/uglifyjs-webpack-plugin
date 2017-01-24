[![build status](https://secure.travis-ci.org/webpack-contrib/uglifyjs-webpack-plugin.svg)](http://travis-ci.org/webpack-contrib/uglifyjs-webpack-plugin) [![bitHound Score](https://www.bithound.io/github/webpack-contrib/uglifyjs-webpack-plugin/badges/score.svg)](https://www.bithound.io/github/webpack-contrib/uglifyjs-webpack-plugin) [![codecov](https://codecov.io/gh/webpack-contrib/uglifyjs-webpack-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/webpack-contrib/uglifyjs-webpack-plugin)

# UglifyJS Webpack Plugin

This plugin uses [UglifyJS](https://github.com/mishoo/UglifyJS2) to minify your JavaScript. It is the same plugin as in webpack core except it has been decoupled from it. This allows you to control the version of UglifyJS you are using.

## Usage

First, install it:

```bash
npm install uglifyjs-webpack-plugin uglify-js --save-dev
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

| Property | Type | Default | Description |
| --- | --- | --- | --- |
| compress | boolean, object | true | See [UglifyJS documentation](http://lisperator.net/uglifyjs/compress). |
| mangle | boolean, object | true | See below. |
| beautify | boolean | false | Beautify output. |
| output | An object providing options for UglifyJS [OutputStream](https://github.com/mishoo/UglifyJS2/blob/master/lib/output.js) | | Lower level access to UglifyJS output. |
| comments | boolean, RegExp, function(astNode, comment) -> boolean | Defaults to preserving comments containing `/*!`, `/**!`, `@preserve` or `@license`. | Comment related configuration. |
| sourceMap | boolean | false | Use SourceMaps to map error message locations to modules. This slows down the compilation. |
| test | RegExp, Array<RegExp> | `/\.js($|\?)/i` | Test to match files against. |
| include | RegExp, Array<RegExp> | | Test only `include` files. |
| exclude | RegExp, Array<RegExp> | | Files to `exclude` from testing. |

## Mangling

`mangle.props (boolean|object)` - Passing `true` or an object enables and provides options for UglifyJS property mangling - see [UglifyJS documentation](https://github.com/mishoo/UglifyJS2#mangleproperties-options) for mangleProperties for options.

> Note: the UglifyJS docs warn that [you will probably break your source if you use property mangling](https://github.com/mishoo/UglifyJS2#mangling-property-names---mangle-props), so if you aren’t sure why you’d need this feature, you most likely shouldn’t be using it! You can tweak the behavior as below:

```javascript
new webpack.optimize.UglifyJsPlugin({
  mangle: {
    // Skip mangling these
    except: ['$super', '$', 'exports', 'require']
  }
})
```

## License

MIT.
