import UglifyJsPlugin from '../src/index';
import {
  cleanErrorStack,
  createCompiler,
  compile,
} from './helpers';

describe('when applied with uglify-es options', () => {
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

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
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

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
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

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
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

      expect(errors).toMatchSnapshot('errors');
      expect(warnings).toMatchSnapshot('warnings');

      for (const file in stats.compilation.assets) {
        if (Object.prototype.hasOwnProperty.call(stats.compilation.assets, file)) {
          expect(stats.compilation.assets[file].source()).toMatchSnapshot(file);
        }
      }
    });
  });

  it('matches snapshot for `parse` options', () => {
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
        parse: {
          ecma: 8,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `compress` option (boolean true)', () => {
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
        compress: true,
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `compress` option (boolean false)', () => {
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
        compress: false,
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `compress` option (object)', () => {
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
        compress: {
          join_vars: false,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `mangle` option (true)', () => {
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
        mangle: true,
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `mangle` option (false)', () => {
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
        mangle: false,
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `mangle` option (object)', () => {
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
        mangle: {
          reserved: ['baz'],
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `output` option', () => {
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
        output: {
          beautify: true,
        },
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('matches snapshot for `ie8` option', () => {
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
        ie8: true,
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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
      },
    }).apply(compiler);

    return compile(compiler).then((stats) => {
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

  it('disable inline optimization by default (have a lot of problems)', () => {
    const compiler = createCompiler({
      entry: `${__dirname}/fixtures/inline-optimization.js`,
      output: {
        path: `${__dirname}/dist-inline-optimization`,
        filename: '[name].js',
        chunkFilename: '[id].[name].js',
      },
    });

    new UglifyJsPlugin().apply(compiler);

    return compile(compiler).then((stats) => {
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
