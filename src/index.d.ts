import * as webpack from 'webpack'

declare namespace UglifyJSPlugin {
  interface Options {
    /** Default: /\.js$/i. Test to match files against. */
    test?: RegExp|RegExp[]

    /** Default: undefined. Files to include. */
    include?: RegExp|RegExp[]

    /** Default: undefined. Files to exclude. */
    exclude?: RegExp|RegExp[]

    /**
     * Default: false. Enable file caching. When true, the path to the cache
     * directory is node_modules/.cache/uglifyjs-webpack-plugin. When a string,
     * caching is enabled at the specified at the specified location.
     */
    cache?: boolean|string

    /**
     * Default: false. Use multi-process parallel running to improve the build
     * speed. When true, the number of concurrent runs is os.cpus().length - 1.
     * When a number, specifies the concurrency limit.
     */
    parallel?: boolean|number

    /**
     * Default: false. Use source maps to map error message locations to modules
     * (this slows down the compilation). Warning: cheap-source-map options
     * don't work with this plugin.
     */
    sourceMap?: boolean 

    /**
     * Defaults to
     * {@link https://github.com/webpack-contrib/uglifyjs-webpack-plugin/tree/master#uglifyoptions {...defaults}}.
     * uglify
     * {@link https://github.com/mishoo/UglifyJS2/tree/harmony#minify-options Options}.
     */
    uglifyOptions?: { [option: string]: any }

    /**
     * Defaults to false. Whether comments shall be extracted to a separate
     * file, (see
     * {@link https://github.com/webpack/webpack/commit/71933e979e51c533b432658d5e37917f9e71595a details})
     * (webpack >= 2.3.0). */
    extractComments?: boolean|RegExp|((node: any, comment: any) => boolean|object)

    /** Defaults to () => true. Allow to  filter uglify warnings. */
    warningsFilter?(source: any): boolean
  }

  class Plugin extends webpack.Plugin {
    constructor(options?: Options)
  }
}

declare module 'uglifyjs-webpack-plugin' {
  export = UglifyJSPlugin.Plugin
}
