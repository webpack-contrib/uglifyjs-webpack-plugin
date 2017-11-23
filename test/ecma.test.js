import UglifyJsPlugin from '../src/index';
import {
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with uglifyOptions.ecma', () => {
  it('matches snapshot for import and export', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/import-export/entry.js`,
      output: {
        path: `${__dirname}/dist-import-export`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 5,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('import-export: errors');
      expect(warnings).toMatchSnapshot('import-export: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`import-export: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 5', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/ecma-5/entry.js`,
      output: {
        path: `${__dirname}/dist-ecma-5`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 5,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('ecma 5: errors');
      expect(warnings).toMatchSnapshot('ecma 5: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`ecma 5: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 6', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/ecma-6/entry.js`,
      output: {
        path: `${__dirname}/dist-ecma-6`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 6,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('ecma 6: errors');
      expect(warnings).toMatchSnapshot('ecma 6: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`ecma 6: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 7', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/ecma-7/entry.js`,
      output: {
        path: `${__dirname}/dist-ecma-7`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });
    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 7,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('ecma 7: errors');
      expect(warnings).toMatchSnapshot('ecma 7: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`ecma 7: ${file}`);
        }
      }
    });
  });

  it('matches snapshot for ecma 8', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/ecma-8/entry.js`,
      output: {
        path: `${__dirname}/dist-ecma-8`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin({
      uglifyOptions: {
        ecma: 8,
        mangle: false,
        warnings: true,
        output: {
          beautify: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
      const errors = stats.compilation.errors.map(cleanErrorStack);
      const warnings = stats.compilation.warnings.map(cleanErrorStack);

      expect(errors).toMatchSnapshot('ecma 8: errors');
      expect(warnings).toMatchSnapshot('ecma 8: warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(`ecma 8: ${file}`);
        }
      }
    });
  });
});
