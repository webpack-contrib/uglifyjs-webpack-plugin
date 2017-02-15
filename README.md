[![build status](https://secure.travis-ci.org/webpack-contrib/uglifyjs-webpack-plugin.svg)](http://travis-ci.org/webpack-contrib/uglifyjs-webpack-plugin) [![bitHound Score](https://www.bithound.io/github/webpack-contrib/uglifyjs-webpack-plugin/badges/score.svg)](https://www.bithound.io/github/webpack-contrib/uglifyjs-webpack-plugin) [![codecov](https://codecov.io/gh/webpack-contrib/uglifyjs-webpack-plugin/branch/master/graph/badge.svg)](https://codecov.io/gh/webpack-contrib/uglifyjs-webpack-plugin)

# UglifyJS Webpack Plugin

This plugin uses [UglifyJS](https://github.com/mishoo/UglifyJS2) to minify your JavaScript. It is the same plugin as in Webpack core (`webpack.optimize.UglifyJSPlugin`) except it has been decoupled from it. This allows you to control the version of UglifyJS you are using.

> Note that webpack contains the same plugin under `webpack.optimize.UglifyJsPlugin`. This is a standalone version for those that want to control the version of UglifyJS. The documentation is valid apart from the installation instructions in that case.

## Usage

First, install the plugin:

```bash
yarn add uglifyjs-webpack-plugin --dev
```

..or if you insist on using npm instead of the more advanced [Yarn](https://yarnpkg.com):

```bash
npm install uglifyjs-webpack-plugin --save-dev
```

**Important!** The plugin has a peer dependency to uglify-js, so in order to use the plugin, also uglify-js has to be installed. The currently (2017/1/25) available uglify-js npm packages, however, do not support minification of ES6 code. In order to support ES6, an ES6-capable, a.k.a. _harmony_, version of UglifyJS has to be provided.

If your minification target is ES6:

```bash
yarn add git://github.com/mishoo/UglifyJS2#harmony --dev
```

If your minification target is ES5:

```bash
yarn add uglify-js --dev
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
| extractComments | boolean, RegExp, function (astNode, comment) -> boolean, object | false | Whether comments shall be extracted to a separate file, see below. |
| sourceMap | boolean | false | Use SourceMaps to map error message locations to modules. This slows down the compilation. |
| test | RegExp, Array<RegExp> | <code>/\.js($&#124;\?)/i</code> | Test to match files against. |
| include | RegExp, Array<RegExp> | | Test only `include` files. |
| exclude | RegExp, Array<RegExp> | | Files to `exclude` from testing. |

## Mangling

`mangle.props (boolean|object)` - Passing `true` or an object enables and provides options for UglifyJS property mangling - see [UglifyJS documentation](https://github.com/mishoo/UglifyJS2#mangleproperties-options) for mangleProperties for options.

> Note: the UglifyJS docs warn that [you will probably break your source if you use property mangling](https://github.com/mishoo/UglifyJS2#mangling-property-names---mangle-props), so if you aren’t sure why you’d need this feature, you most likely shouldn’t be using it! You can tweak the behavior as below:

```javascript
new UglifyJsPlugin({
  mangle: {
    // Skip mangling these
    except: ['$super', '$', 'exports', 'require']
  }
})
```

## Extracting Comments
The `extractComments` option can be
- `true`: All comments that normally would be preserved by the `comments` option will be moved to a separate file. If the original file is named `foo.js`, then the comments will be stored to `foo.js.LICENSE`
- regular expression (given as `RegExp` or `string`) or a `function (astNode, comment) -> boolean`:
  All comments that match the given expression (resp. are evaluated to `true` by the function) will be extracted to the separate file. The `comments` option specifies whether the comment will be preserved, i.e. it is possible to preserve some comments (e.g. annotations) while extracting others or even preserving comments that have been extracted.
- an `object` consisting of the following keys, all optional:
  - `condition`: regular expression or function (see previous point)
  - `filename`: The file where the extracted comments will be stored. Can be either a `string` or `function (string) -> string` which will be given the original filename. Default is to append the suffix `.LICENSE` to the original filename.
  - `banner`: The banner text that points to the extracted file and will be added on top of the original file. will be added to the original file. Can be `false` (no banner), a `string`, or a `function (string) -> string` that will be called with the filename where extracted comments have been stored. Will be wrapped into comment.
Default: `/*! For license information please see foo.js.LICENSE */`

## License

MIT.
