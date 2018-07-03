import uglifyJs from 'uglify-js';
import uglifyEs from 'uglify-es';
import terser from 'terser';
import UglifyJsPlugin from '../src';
import { cleanErrorStack, compile, createCompiler } from './helpers';

describe('when applied with minify option', () => {
  it('matches snapshot for `uglify-js` minifier', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/uglify-js.js`,
      output: {
        path: `${__dirname}/dist-uglify-js`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      minify(file, uglifyOptions) {
        return uglifyJs.minify(file, uglifyOptions);
      },
      uglifyOptions: {
        mangle: {
          reserved: ['baz'],
        },
      },
    }).apply(compiler);

    return compile(compiler)
      .then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('errors');
        expect(warnings).toMatchSnapshot('warnings');

        for (const file in stats.compilation.assets) {
          if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
          }
        }
      });
  });

  it('matches snapshot for `uglify-es` minifier', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/uglify-es.js`,
      output: {
        path: `${__dirname}/dist-uglify-es`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      minify(file, uglifyOptions) {
        return uglifyEs.minify(file, uglifyOptions);
      },
      uglifyOptions: {
        mangle: {
          reserved: ['baz'],
        },
      },
    }).apply(compiler);

    return compile(compiler)
      .then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('errors');
        expect(warnings).toMatchSnapshot('warnings');

        for (const file in stats.compilation.assets) {
          if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
          }
        }
      });
  });

  it('matches snapshot for `terser` minifier', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/minify/terser`,
      output: {
        path: `${__dirname}/dist-terser`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      minify(file, uglifyOptions) {
        return terser.minify(file, uglifyOptions);
      },
      uglifyOptions: {
        mangle: {
          reserved: ['baz'],
        },
      },
    }).apply(compiler);

    return compile(compiler)
      .then((stats) => {
        const errors = stats.compilation.errors.map(cleanErrorStack);
        const warnings = stats.compilation.warnings.map(cleanErrorStack);

        expect(errors).toMatchSnapshot('errors');
        expect(warnings).toMatchSnapshot('warnings');

        for (const file in stats.compilation.assets) {
          if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
            expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
          }
        }
      });
  });
});
