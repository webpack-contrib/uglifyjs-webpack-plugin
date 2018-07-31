import UglifyJsPlugin from '../src/index';
import { createCompiler, compile, cleanErrorStack } from './helpers';

describe('when options.sourceMap', () => {
  it('matches snapshot for a single `false` value (`devtool` is `source-map`)', () => {
    const compiler = createCompiler({
      entry: {
        entry: `${__dirname}/fixtures/entry.js`,
      },
      devtool: 'source-map',
    });

    new UglifyJsPlugin({ sourceMap: false }).apply(compiler);

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

  it('matches snapshot for a single `false` value (`devtool` is `false`)', () => {
    const compiler = createCompiler({
      entry: {
        entry: `${__dirname}/fixtures/entry.js`,
      },
      devtool: false,
    });

    new UglifyJsPlugin({ sourceMap: false }).apply(compiler);

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

  it('matches snapshot for a single `true` value (`devtool` is `source-map`)', () => {
    const compiler = createCompiler({
      entry: {
        entry: `${__dirname}/fixtures/entry.js`,
      },
      devtool: 'source-map',
    });

    new UglifyJsPlugin({ sourceMap: true }).apply(compiler);

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

  it('matches snapshot for a single `true` value (`devtool` is `false`)', () => {
    const compiler = createCompiler({
      entry: {
        entry: `${__dirname}/fixtures/entry.js`,
      },
      devtool: false,
    });

    new UglifyJsPlugin({ sourceMap: true }).apply(compiler);

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
