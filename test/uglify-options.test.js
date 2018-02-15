import UglifyJsPlugin from '../src/index';
import {
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with uglify-es options', () => {
  it('matches snapshot for `toplevel` option', () => {
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
        toplevel: true,
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

  it('matches snapshot for `nameCache` option', () => {
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
        nameCache: {},
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

  it('matches snapshot for `keep_classnames` option', () => {
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
        keep_classnames: true,
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

  it('matches snapshot for `keep_fnames` option', () => {
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
        keep_fnames: true,
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

  it('matches snapshot for `safari10` option', () => {
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
        safari10: true,
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
});
