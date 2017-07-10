import UglifyJsPlugin from '../src/index';
import {
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with uglifyOptions.ecma', () => {
  it('matches snapshot for ecma 5', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/es2015/entry.js`,
      output: {
        path: `${__dirname}/dist-2015`,
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[name].[chunkhash].js',
      },
    });

    new UglifyJsPlugin({
      parallel: { cache: false },
      uglifyOptions: {
        ecma: 5,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
          comments: false,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('es5: errors');
      expect(warnings).toMatchSnapshot('es5: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`es5: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 6', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/es2015/entry.js`,
      output: {
        path: `${__dirname}/dist-2015`,
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[name].[chunkhash].js',
      },
    });

    new UglifyJsPlugin({
      parallel: { cache: false },
      uglifyOptions: {
        ecma: 6,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
          comments: false,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('es6: errors');
      expect(warnings).toMatchSnapshot('es6: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`es6: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 7', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/es2015/entry.js`,
      output: {
        path: `${__dirname}/dist-2015`,
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[name].[chunkhash].js',
      },
    });
    new UglifyJsPlugin({
      parallel: { cache: false },
      uglifyOptions: {
        ecma: 7,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
          comments: false,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('es7: errors');
      expect(warnings).toMatchSnapshot('es7: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`es7: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 8', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/es2015/entry.js`,
      output: {
        path: `${__dirname}/dist-2015`,
        filename: '[name].[chunkhash].js',
        chunkFilename: '[id].[name].[chunkhash].js',
      },
    });

    new UglifyJsPlugin({
      parallel: { cache: false },
      uglifyOptions: {
        ecma: 8,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
          comments: false,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('es8: errors');
      expect(warnings).toMatchSnapshot('es8: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`es8: ${file}`);
        }
      }
    });
  });
});
